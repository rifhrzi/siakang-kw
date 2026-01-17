const gcd = (a, b) => {
  if (!b) return a;
  return gcd(b, a % b);
};

const gcdForArray = (weights = []) =>
  weights.length ? weights.reduce((acc, value) => gcd(acc, value)) : 0;

/**
 * Weighted Round Robin selection as described in nginx and LVS.
 * Keeps a small internal pointer so the distribution stays predictable.
 */
export class WeightedRoundRobin {
  constructor(servers = []) {
    this.name = 'weighted-round-robin';
    this.label = 'Weighted Round Robin';
    this.servers = servers;
    this.signature = '';
    this.activeServers = [];
    this.currentIndex = -1;
    this.currentWeight = 0;
    this.gcdWeight = 0;
    this.maxWeight = 0;
    this.sync();
  }

  activeCount() {
    this.sync();
    return this.activeServers.length;
  }

  sync() {
    const active = this.servers.filter(
      (server) => server.status === 'up' && server.weight > 0
    );
    const signature = active
      .map((server) => `${server.id}:${server.weight}:${server.status}`)
      .join('|');

    if (signature !== this.signature) {
      this.signature = signature;
      this.activeServers = active;
      this.currentIndex = -1;
      this.currentWeight = 0;
      this.maxWeight = active.length
        ? Math.max(...active.map((item) => item.weight))
        : 0;
      this.gcdWeight = active.length
        ? gcdForArray(active.map((item) => item.weight))
        : 0;
    }
  }

  next() {
    this.sync();
    const active = this.activeServers;
    if (!active.length) return null;

    while (true) {
      this.currentIndex = (this.currentIndex + 1) % active.length;
      if (this.currentIndex === 0) {
        this.currentWeight -= this.gcdWeight;
        if (this.currentWeight <= 0) {
          this.currentWeight = this.maxWeight;
          if (this.currentWeight === 0) return null;
        }
      }
      if (active[this.currentIndex].weight >= this.currentWeight) {
        return active[this.currentIndex];
      }
    }
  }

  reset() {
    this.currentIndex = -1;
    this.currentWeight = 0;
    this.signature = '';
    this.sync();
  }
}

/**
 * Simple Round Robin - distributes requests evenly regardless of weight
 */
export class SimpleRoundRobin {
  constructor(servers = []) {
    this.name = 'simple-round-robin';
    this.label = 'Simple Round Robin';
    this.servers = servers;
    this.currentIndex = -1;
    this.activeServers = [];
    this.sync();
  }

  activeCount() {
    this.sync();
    return this.activeServers.length;
  }

  sync() {
    this.activeServers = this.servers.filter(
      (server) => server.status === 'up' && server.weight > 0
    );
  }

  next() {
    this.sync();
    const active = this.activeServers;
    if (!active.length) return null;

    this.currentIndex = (this.currentIndex + 1) % active.length;
    return active[this.currentIndex];
  }

  reset() {
    this.currentIndex = -1;
    this.sync();
  }
}

/**
 * Random selection - picks a random server for each request
 */
export class RandomSelection {
  constructor(servers = []) {
    this.name = 'random';
    this.label = 'Random Selection';
    this.servers = servers;
    this.activeServers = [];
    this.sync();
  }

  activeCount() {
    this.sync();
    return this.activeServers.length;
  }

  sync() {
    this.activeServers = this.servers.filter(
      (server) => server.status === 'up' && server.weight > 0
    );
  }

  next() {
    this.sync();
    const active = this.activeServers;
    if (!active.length) return null;

    const randomIndex = Math.floor(Math.random() * active.length);
    return active[randomIndex];
  }

  reset() {
    this.sync();
  }
}

/**
 * Factory function to create load balancer instances
 */
export function createLoadBalancer(algorithm, servers) {
  switch (algorithm) {
    case 'weighted-round-robin':
      return new WeightedRoundRobin(servers);
    case 'simple-round-robin':
      return new SimpleRoundRobin(servers);
    case 'random':
      return new RandomSelection(servers);
    default:
      return new WeightedRoundRobin(servers);
  }
}

/**
 * XYZ Server Pool Configuration
 * ================================
 * Konfigurasi server backend untuk simulasi load balancer XYZ
 * Total Kapasitas: ~4200 req/sec dengan 3 app server + 1 DR
 * 
 * Statistik XYZ:
 * - 32.847 mahasiswa (28.456 aktif)
 * - 1.247 dosen
 * - 47 fitur/modul
 * - Peak: 320.000 request/hari (KRS season)
 * - Normal: 98.500 request/hari
 */
export const upstreamPool = [
  {
    id: 'backend-1',
    label: 'Backend Server 1',
    host: 'backend1:4000',
    region: 'Tencent Cloud VPS',
    weight: 5,
    status: 'up',
    latencyMs: 45,
    role: 'Primary Backend - High Capacity',
    capacity: 1000,
    errorRate: 0.02,
    specs: 'Docker Container (Node.js)',
  },
  {
    id: 'backend-2',
    label: 'Backend Server 2',
    host: 'backend2:4000',
    region: 'Tencent Cloud VPS',
    weight: 3,
    status: 'up',
    latencyMs: 48,
    role: 'Secondary Backend - Medium Capacity',
    capacity: 600,
    errorRate: 0.025,
    specs: 'Docker Container (Node.js)',
  },
  {
    id: 'backend-3',
    label: 'Backend Server 3',
    host: 'backend3:4000',
    region: 'Tencent Cloud VPS',
    weight: 2,
    status: 'up',
    latencyMs: 52,
    role: 'Tertiary Backend - Low Capacity',
    capacity: 400,
    errorRate: 0.03,
    specs: 'Docker Container (Node.js)',
  },
];

/**
 * Statistik Infrastruktur XYZ
 */
export const XYZInfraStats = {
  totalServer: 12,
  serverAktif: 10,
  loadBalancer: {
    primary: 'Nginx (WRR)',
    secondary: 'Nginx (Failover)',
  },
  database: {
    type: 'PostgreSQL',
    master: 'DC Serang (128 GB RAM)',
    slave: 'DC Cilegon (128 GB RAM)',
    drReplica: 'DC Jakarta',
  },
  cache: {
    type: 'Redis Cluster',
    memory: '32 GB',
    hitRatio: '94.2%',
  },
  monitoring: ['Prometheus', 'Grafana', 'AlertManager'],
  uptime: '99.72%',
  sla: '99.5%',
};

/**
 * Peak Time Configuration
 */
export const peakTimeConfig = {
  // Jam sibuk harian
  dailyPeaks: [
    { start: '07:00', end: '10:00', multiplier: 2.5, label: 'Peak Pagi' },
    { start: '13:00', end: '15:00', multiplier: 2.0, label: 'Peak Siang' },
    { start: '19:00', end: '21:00', multiplier: 3.0, label: 'Peak Malam' },
  ],
  // Season dengan traffic tinggi
  seasonalPeaks: [
    { event: 'KRS Online', months: [2, 8], multiplier: 4.0 },
    { event: 'Registrasi', months: [1, 7], multiplier: 3.5 },
    { event: 'UAS/Input Nilai', months: [5, 12], multiplier: 2.5 },
  ],
  // Request stats
  requestStats: {
    avgDaily: 98500,
    peakDaily: 320000,
    avgPerSecond: 1.14,
    peakPerSecond: 7.8,
  },
};

