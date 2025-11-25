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

export const upstreamPool = [
  {
    id: 'registrasi-core',
    label: 'Registrasi Core',
    host: '10.10.10.11',
    region: 'DC Serang',
    weight: 5,
    status: 'up',
    latencyMs: 46,
    role: 'Pembayaran & registrasi',
    capacity: 1000,
    errorRate: 0.02,
  },
  {
    id: 'akademik-rsrv',
    label: 'Akademik Reserve',
    host: '10.10.10.12',
    region: 'DC Cilegon',
    weight: 3,
    status: 'up',
    latencyMs: 62,
    role: 'KRS & jadwal',
    capacity: 600,
    errorRate: 0.03,
  },
  {
    id: 'dr-site',
    label: 'DR Site',
    host: '172.16.20.31',
    region: 'Pusat DR',
    weight: 1,
    status: 'up',
    latencyMs: 105,
    role: 'Cadangan bencana',
    capacity: 200,
    errorRate: 0.08,
  },
  {
    id: 'lab-perf',
    label: 'Lab Performance',
    host: '10.10.55.10',
    region: 'Lab Infrastruktur',
    weight: 2,
    status: 'up',
    latencyMs: 54,
    role: 'Stress test & QA',
    capacity: 400,
    errorRate: 0.04,
  },
];
