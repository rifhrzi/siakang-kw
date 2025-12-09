import cors from 'cors';
import express from 'express';
import {
  upstreamPool,
  createLoadBalancer,
  WeightedRoundRobin,
  SimpleRoundRobin,
  RandomSelection,
} from './loadBalancer.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Deep clone function for server pool
const clonePool = () =>
  JSON.parse(JSON.stringify(upstreamPool)).map((s) => ({
    ...s,
    currentLoad: 0,
    activeConnections: 0,
  }));

// A/B Test State
const abTestState = {
  isRunning: false,
  startedAt: null,
  completedAt: null,
  config: {
    requestCount: 100,
    requestsPerSecond: 10,
    simulateRealLatency: true,
    simulateErrors: true,
  },
  // Group A: Weighted Round Robin
  groupA: {
    algorithm: 'weighted-round-robin',
    label: 'Weighted Round Robin',
    pool: clonePool(),
    balancer: null,
    stats: createEmptyStats(),
    dispatches: [],
  },
  // Group B: Simple Round Robin (or Random)
  groupB: {
    algorithm: 'simple-round-robin',
    label: 'Simple Round Robin',
    pool: clonePool(),
    balancer: null,
    stats: createEmptyStats(),
    dispatches: [],
  },
};

function createEmptyStats() {
  return {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalLatency: 0,
    avgLatency: 0,
    minLatency: Infinity,
    maxLatency: 0,
    p95Latency: 0,
    p99Latency: 0,
    throughput: 0,
    errorRate: 0,
    serverDistribution: {},
    latencies: [],
    startTime: null,
    endTime: null,
  };
}

function initializeBalancers() {
  abTestState.groupA.balancer = createLoadBalancer(
    abTestState.groupA.algorithm,
    abTestState.groupA.pool
  );
  abTestState.groupB.balancer = createLoadBalancer(
    abTestState.groupB.algorithm,
    abTestState.groupB.pool
  );
}

initializeBalancers();

// Simulate realistic latency with jitter and load-based variation
function simulateLatency(server, simulateReal = true) {
  const baseLatency = server.latencyMs;
  if (!simulateReal) {
    return Math.max(8, Math.round(baseLatency + (Math.random() - 0.5) * 14));
  }

  // Add load-based latency increase
  const loadFactor = Math.min(server.currentLoad / (server.capacity || 1000), 1);
  const loadLatency = baseLatency * loadFactor * 0.5;

  // Add random jitter (±20%)
  const jitter = baseLatency * (Math.random() - 0.5) * 0.4;

  // Add occasional spikes (5% chance of 2x-3x latency)
  const spike = Math.random() < 0.05 ? baseLatency * (1 + Math.random() * 2) : 0;

  return Math.max(8, Math.round(baseLatency + loadLatency + jitter + spike));
}

// Simulate request with realistic behavior
function simulateRequest(server, config) {
  const latency = simulateLatency(server, config.simulateRealLatency);

  // Simulate errors based on server error rate and load
  let isError = false;
  if (config.simulateErrors) {
    const loadFactor = Math.min(server.currentLoad / (server.capacity || 1000), 1);
    const effectiveErrorRate = server.errorRate * (1 + loadFactor * 2);
    isError = Math.random() < effectiveErrorRate;
  }

  return { latency, isError };
}

// Calculate percentile from sorted array
function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// Process a single request for A/B testing
function processRequest(group, requestId, config) {
  const target = group.balancer.next();
  if (!target) {
    return { success: false, error: 'No active servers' };
  }

  // Increment load
  target.currentLoad = (target.currentLoad || 0) + 1;
  target.activeConnections = (target.activeConnections || 0) + 1;

  const { latency, isError } = simulateRequest(target, config);

  // Update stats
  group.stats.totalRequests++;
  group.stats.latencies.push(latency);
  group.stats.totalLatency += latency;

  if (isError) {
    group.stats.failedRequests++;
  } else {
    group.stats.successfulRequests++;
  }

  group.stats.minLatency = Math.min(group.stats.minLatency, latency);
  group.stats.maxLatency = Math.max(group.stats.maxLatency, latency);

  // Track server distribution
  group.stats.serverDistribution[target.id] =
    (group.stats.serverDistribution[target.id] || 0) + 1;

  // Decrement load after "processing"
  setTimeout(() => {
    target.currentLoad = Math.max(0, (target.currentLoad || 1) - 1);
    target.activeConnections = Math.max(0, (target.activeConnections || 1) - 1);
  }, latency);

  const dispatch = {
    requestId,
    serverId: target.id,
    serverLabel: target.label,
    host: target.host,
    weight: target.weight,
    latencyMs: latency,
    isError,
    at: new Date().toISOString(),
    region: target.region,
  };

  group.dispatches.unshift(dispatch);
  if (group.dispatches.length > 100) group.dispatches.pop();

  return { success: true, dispatch };
}

// Finalize stats after test completes
function finalizeStats(group) {
  const stats = group.stats;
  if (stats.totalRequests > 0) {
    stats.avgLatency = Math.round(stats.totalLatency / stats.totalRequests);
    stats.p95Latency = percentile(stats.latencies, 95);
    stats.p99Latency = percentile(stats.latencies, 99);
    stats.errorRate = stats.failedRequests / stats.totalRequests;

    if (stats.endTime && stats.startTime) {
      const durationSec = (stats.endTime - stats.startTime) / 1000;
      stats.throughput = durationSec > 0 ? stats.totalRequests / durationSec : 0;
    }
  }
  if (stats.minLatency === Infinity) stats.minLatency = 0;
}

// Build server stats for a group
function buildServerStats(group) {
  return group.pool.map((server) => ({
    ...server,
    stats: {
      served: group.stats.serverDistribution[server.id] || 0,
      share:
        group.stats.totalRequests > 0
          ? Math.round(
              ((group.stats.serverDistribution[server.id] || 0) /
                group.stats.totalRequests) *
                100
            )
          : 0,
    },
  }));
}

// ========== Legacy Single-Algorithm Endpoints ==========

const legacyPool = clonePool();
const legacyBalancer = new WeightedRoundRobin(legacyPool);
const legacyStats = Object.fromEntries(
  legacyPool.map((server) => [
    server.id,
    { served: 0, lastLatencyMs: null, lastDispatchedAt: null },
  ])
);
let legacyTotalRequests = 0;
let legacyRequestCursor = 0;
const legacyDispatchLog = [];

const buildLegacyPayload = () => ({
  servers: legacyPool.map((server) => ({
    ...server,
    stats: {
      served: legacyStats[server.id]?.served ?? 0,
      lastLatencyMs: legacyStats[server.id]?.lastLatencyMs ?? null,
      lastDispatchedAt: legacyStats[server.id]?.lastDispatchedAt ?? null,
    },
  })),
  totals: {
    requests: legacyTotalRequests,
    activeTargets: legacyBalancer.activeCount(),
    algorithm: 'weighted-round-robin',
  },
  recentDispatches: legacyDispatchLog.slice(0, 24),
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', algorithm: 'weighted-round-robin' });
});

app.get('/api/servers', (_req, res) => {
  res.json(buildLegacyPayload());
});

app.post('/api/traffic', (req, res) => {
  const count = Math.max(Number(req.body?.count) || 1, 1); // No upper limit for stress testing
  const dispatched = [];

  for (let i = 0; i < count; i += 1) {
    const target = legacyBalancer.next();

    if (!target) {
      return res
        .status(503)
        .json({ message: 'Load balancer tidak menemukan server aktif.' });
    }

    legacyTotalRequests += 1;
    legacyRequestCursor += 1;

    legacyStats[target.id] ??= {};
    legacyStats[target.id].served = (legacyStats[target.id].served ?? 0) + 1;

    const latencyMs = simulateLatency(target, false);
    const event = {
      requestId: legacyRequestCursor,
      serverId: target.id,
      serverLabel: target.label,
      host: target.host,
      weight: target.weight,
      latencyMs,
      at: new Date().toISOString(),
      region: target.region,
    };

    legacyStats[target.id].lastLatencyMs = latencyMs;
    legacyStats[target.id].lastDispatchedAt = event.at;

    dispatched.push(event);
    legacyDispatchLog.unshift(event);
    if (legacyDispatchLog.length > 40) legacyDispatchLog.pop();
  }

  return res.json({
    dispatched,
    ...buildLegacyPayload(),
  });
});

app.patch('/api/servers/:id', (req, res) => {
  const target = legacyPool.find((server) => server.id === req.params.id);
  if (!target) {
    return res.status(404).json({ message: 'Server tidak ditemukan.' });
  }

  const { weight, status } = req.body ?? {};

  if (weight !== undefined) {
    const parsed = Number(weight);
    if (Number.isFinite(parsed) && parsed >= 0) {
      target.weight = parsed;
    }
  }

  if (status && (status === 'up' || status === 'down')) {
    target.status = status;
  }

  legacyBalancer.sync();
  return res.json(buildLegacyPayload());
});

// Add a new server
app.post('/api/servers', (req, res) => {
  const { label, host, region, weight, role, latencyMs } = req.body ?? {};

  if (!label || !host) {
    return res.status(400).json({ message: 'Label dan host wajib diisi.' });
  }

  // Generate unique ID from label
  const id = label.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36);

  const newServer = {
    id,
    label,
    host,
    region: region || 'Custom',
    weight: Math.max(1, Number(weight) || 1),
    status: 'up',
    latencyMs: Math.max(10, Number(latencyMs) || 50),
    role: role || 'Custom server',
    capacity: 500,
    errorRate: 0.05,
    currentLoad: 0,
    activeConnections: 0,
  };

  legacyPool.push(newServer);
  legacyStats[id] = { served: 0, lastLatencyMs: null, lastDispatchedAt: null };
  legacyBalancer.sync();

  return res.json(buildLegacyPayload());
});

// Delete a server
app.delete('/api/servers/:id', (req, res) => {
  const index = legacyPool.findIndex((server) => server.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Server tidak ditemukan.' });
  }

  legacyPool.splice(index, 1);
  delete legacyStats[req.params.id];
  legacyBalancer.sync();

  return res.json(buildLegacyPayload());
});

app.post('/api/reset', (_req, res) => {
  Object.keys(legacyStats).forEach((key) => {
    legacyStats[key] = {
      served: 0,
      lastLatencyMs: null,
      lastDispatchedAt: null,
    };
  });

  legacyTotalRequests = 0;
  legacyRequestCursor = 0;
  legacyDispatchLog.length = 0;
  legacyBalancer.sync();

  return res.json(buildLegacyPayload());
});

// ========== A/B Testing Endpoints ==========

app.get('/api/ab-test/algorithms', (_req, res) => {
  res.json({
    algorithms: [
      {
        id: 'weighted-round-robin',
        label: 'Weighted Round Robin',
        description:
          'Distributes traffic based on server weights. Higher weight = more traffic.',
      },
      {
        id: 'simple-round-robin',
        label: 'Simple Round Robin',
        description:
          'Distributes traffic evenly across all servers regardless of capacity.',
      },
      {
        id: 'random',
        label: 'Random Selection',
        description:
          'Randomly selects a server for each request. Simple but unpredictable.',
      },
    ],
  });
});

app.get('/api/ab-test/status', (_req, res) => {
  res.json({
    isRunning: abTestState.isRunning,
    startedAt: abTestState.startedAt,
    completedAt: abTestState.completedAt,
    config: abTestState.config,
    groupA: {
      algorithm: abTestState.groupA.algorithm,
      label: abTestState.groupA.label,
      stats: abTestState.groupA.stats,
      servers: buildServerStats(abTestState.groupA),
      recentDispatches: abTestState.groupA.dispatches.slice(0, 20),
    },
    groupB: {
      algorithm: abTestState.groupB.algorithm,
      label: abTestState.groupB.label,
      stats: abTestState.groupB.stats,
      servers: buildServerStats(abTestState.groupB),
      recentDispatches: abTestState.groupB.dispatches.slice(0, 20),
    },
  });
});

app.post('/api/ab-test/configure', (req, res) => {
  if (abTestState.isRunning) {
    return res.status(400).json({ message: 'Test sedang berjalan.' });
  }

  const {
    groupAAlgorithm,
    groupBAlgorithm,
    requestCount,
    requestsPerSecond,
    simulateRealLatency,
    simulateErrors,
  } = req.body ?? {};

  if (groupAAlgorithm) {
    abTestState.groupA.algorithm = groupAAlgorithm;
    abTestState.groupA.label =
      groupAAlgorithm === 'weighted-round-robin'
        ? 'Weighted Round Robin'
        : groupAAlgorithm === 'simple-round-robin'
          ? 'Simple Round Robin'
          : 'Random Selection';
  }

  if (groupBAlgorithm) {
    abTestState.groupB.algorithm = groupBAlgorithm;
    abTestState.groupB.label =
      groupBAlgorithm === 'weighted-round-robin'
        ? 'Weighted Round Robin'
        : groupBAlgorithm === 'simple-round-robin'
          ? 'Simple Round Robin'
          : 'Random Selection';
  }

  if (requestCount !== undefined) {
    abTestState.config.requestCount = Math.max(requestCount, 1); // No upper limit for stress testing
  }

  if (requestsPerSecond !== undefined) {
    abTestState.config.requestsPerSecond = Math.min(
      Math.max(requestsPerSecond, 1),
      100
    );
  }

  if (simulateRealLatency !== undefined) {
    abTestState.config.simulateRealLatency = Boolean(simulateRealLatency);
  }

  if (simulateErrors !== undefined) {
    abTestState.config.simulateErrors = Boolean(simulateErrors);
  }

  // Reinitialize balancers with new algorithms
  initializeBalancers();

  res.json({
    message: 'Konfigurasi A/B test diperbarui.',
    config: abTestState.config,
    groupA: { algorithm: abTestState.groupA.algorithm },
    groupB: { algorithm: abTestState.groupB.algorithm },
  });
});

app.post('/api/ab-test/start', async (req, res) => {
  if (abTestState.isRunning) {
    return res.status(400).json({ message: 'Test sudah berjalan.' });
  }

  // Reset state
  abTestState.groupA.pool = clonePool();
  abTestState.groupB.pool = clonePool();
  abTestState.groupA.stats = createEmptyStats();
  abTestState.groupB.stats = createEmptyStats();
  abTestState.groupA.dispatches = [];
  abTestState.groupB.dispatches = [];

  initializeBalancers();

  abTestState.isRunning = true;
  abTestState.startedAt = new Date().toISOString();
  abTestState.completedAt = null;

  const { requestCount, requestsPerSecond, simulateRealLatency, simulateErrors } =
    abTestState.config;

  abTestState.groupA.stats.startTime = Date.now();
  abTestState.groupB.stats.startTime = Date.now();

  res.json({
    message: 'A/B test dimulai.',
    config: abTestState.config,
  });

  // Run test asynchronously
  const intervalMs = 1000 / requestsPerSecond;
  let processedCount = 0;

  const runTest = () => {
    if (processedCount >= requestCount || !abTestState.isRunning) {
      // Test complete
      abTestState.isRunning = false;
      abTestState.completedAt = new Date().toISOString();
      abTestState.groupA.stats.endTime = Date.now();
      abTestState.groupB.stats.endTime = Date.now();
      finalizeStats(abTestState.groupA);
      finalizeStats(abTestState.groupB);
      return;
    }

    processedCount++;
    const config = { simulateRealLatency, simulateErrors };

    // Process request for both groups simultaneously
    processRequest(abTestState.groupA, processedCount, config);
    processRequest(abTestState.groupB, processedCount, config);

    setTimeout(runTest, intervalMs);
  };

  runTest();
});

app.post('/api/ab-test/stop', (_req, res) => {
  if (!abTestState.isRunning) {
    return res.status(400).json({ message: 'Tidak ada test yang berjalan.' });
  }

  abTestState.isRunning = false;
  abTestState.completedAt = new Date().toISOString();
  abTestState.groupA.stats.endTime = Date.now();
  abTestState.groupB.stats.endTime = Date.now();
  finalizeStats(abTestState.groupA);
  finalizeStats(abTestState.groupB);

  res.json({ message: 'A/B test dihentikan.' });
});

app.post('/api/ab-test/reset', (_req, res) => {
  abTestState.isRunning = false;
  abTestState.startedAt = null;
  abTestState.completedAt = null;
  abTestState.groupA.pool = clonePool();
  abTestState.groupB.pool = clonePool();
  abTestState.groupA.stats = createEmptyStats();
  abTestState.groupB.stats = createEmptyStats();
  abTestState.groupA.dispatches = [];
  abTestState.groupB.dispatches = [];

  initializeBalancers();

  res.json({ message: 'A/B test direset.' });
});

// Quick simulation endpoint for immediate comparison
app.post('/api/ab-test/quick-sim', (req, res) => {
  const count = Math.max(Number(req.body?.count) || 50, 1); // No upper limit for stress testing
  const config = {
    simulateRealLatency: req.body?.simulateRealLatency ?? true,
    simulateErrors: req.body?.simulateErrors ?? true,
  };

  // Create fresh pools and balancers for quick sim
  const quickPoolA = clonePool();
  const quickPoolB = clonePool();

  const balancerA = createLoadBalancer('weighted-round-robin', quickPoolA);
  const balancerB = createLoadBalancer(
    req.body?.compareAlgorithm || 'simple-round-robin',
    quickPoolB
  );

  const resultsA = { dispatches: [], latencies: [], errors: 0, distribution: {} };
  const resultsB = { dispatches: [], latencies: [], errors: 0, distribution: {} };

  for (let i = 1; i <= count; i++) {
    // Process for Algorithm A (WRR)
    const targetA = balancerA.next();
    if (targetA) {
      targetA.currentLoad = (targetA.currentLoad || 0) + 1;
      const simA = simulateRequest(targetA, config);
      resultsA.latencies.push(simA.latency);
      if (simA.isError) resultsA.errors++;
      resultsA.distribution[targetA.id] = (resultsA.distribution[targetA.id] || 0) + 1;
      resultsA.dispatches.push({
        requestId: i,
        serverId: targetA.id,
        serverLabel: targetA.label,
        latencyMs: simA.latency,
        isError: simA.isError,
      });
      targetA.currentLoad = Math.max(0, targetA.currentLoad - 1);
    }

    // Process for Algorithm B
    const targetB = balancerB.next();
    if (targetB) {
      targetB.currentLoad = (targetB.currentLoad || 0) + 1;
      const simB = simulateRequest(targetB, config);
      resultsB.latencies.push(simB.latency);
      if (simB.isError) resultsB.errors++;
      resultsB.distribution[targetB.id] = (resultsB.distribution[targetB.id] || 0) + 1;
      resultsB.dispatches.push({
        requestId: i,
        serverId: targetB.id,
        serverLabel: targetB.label,
        latencyMs: simB.latency,
        isError: simB.isError,
      });
      targetB.currentLoad = Math.max(0, targetB.currentLoad - 1);
    }
  }

  const calcStats = (results) => ({
    totalRequests: results.latencies.length,
    avgLatency: Math.round(
      results.latencies.reduce((a, b) => a + b, 0) / results.latencies.length
    ),
    minLatency: Math.min(...results.latencies),
    maxLatency: Math.max(...results.latencies),
    p95Latency: percentile(results.latencies, 95),
    p99Latency: percentile(results.latencies, 99),
    errorRate: results.errors / results.latencies.length,
    errors: results.errors,
    distribution: results.distribution,
  });

  res.json({
    requestCount: count,
    config,
    groupA: {
      algorithm: 'weighted-round-robin',
      label: 'Weighted Round Robin',
      stats: calcStats(resultsA),
      recentDispatches: resultsA.dispatches.slice(-20).reverse(),
    },
    groupB: {
      algorithm: req.body?.compareAlgorithm || 'simple-round-robin',
      label:
        req.body?.compareAlgorithm === 'random'
          ? 'Random Selection'
          : 'Simple Round Robin',
      stats: calcStats(resultsB),
      recentDispatches: resultsB.dispatches.slice(-20).reverse(),
    },
  });
});

app.listen(port, () => {
  console.log(`Load balancer API listening on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  GET    /api/health');
  console.log('  GET    /api/servers');
  console.log('  POST   /api/servers          (add new server)');
  console.log('  PATCH  /api/servers/:id      (update server)');
  console.log('  DELETE /api/servers/:id      (remove server)');
  console.log('  POST   /api/traffic');
  console.log('  POST   /api/reset');
  console.log('  GET    /api/ab-test/status');
  console.log('  GET    /api/ab-test/algorithms');
  console.log('  POST   /api/ab-test/configure');
  console.log('  POST   /api/ab-test/start');
  console.log('  POST   /api/ab-test/stop');
  console.log('  POST   /api/ab-test/reset');
  console.log('  POST   /api/ab-test/quick-sim');
});
