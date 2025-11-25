import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_LB_BASE_URL || 'http://localhost:4000';

export default function LoadBalancerPage() {
  const [activeTab, setActiveTab] = useState('simulation');
  const [servers, setServers] = useState([]);
  const [totals, setTotals] = useState({ requests: 0, activeTargets: 0 });
  const [recent, setRecent] = useState([]);
  const [customCount, setCustomCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingServer, setUpdatingServer] = useState(null);
  const [error, setError] = useState(null);

  // A/B Testing State
  const [abTestStatus, setAbTestStatus] = useState(null);
  const [abConfig, setAbConfig] = useState({
    groupAAlgorithm: 'weighted-round-robin',
    groupBAlgorithm: 'simple-round-robin',
    requestCount: 100,
    requestsPerSecond: 10,
    simulateRealLatency: true,
    simulateErrors: true,
  });
  const [quickSimCount, setQuickSimCount] = useState(50);
  const [quickSimResults, setQuickSimResults] = useState(null);
  const [compareAlgorithm, setCompareAlgorithm] = useState('simple-round-robin');

  const totalServed = useMemo(
    () =>
      servers.reduce(
        (sum, server) => sum + (server.stats?.served ?? 0),
        0
      ),
    [servers]
  );

  const activeStats = useMemo(() => {
    const active = servers.filter(
      (server) => server.status === 'up' && server.weight > 0
    );
    const avgWeight = active.length
      ? active.reduce((sum, server) => sum + server.weight, 0) / active.length
      : 0;

    return { activeCount: active.length, avgWeight: avgWeight.toFixed(1) };
  }, [servers]);

  useEffect(() => {
    fetchState();
    fetchAbTestStatus();
  }, []);

  // Poll A/B test status while running
  useEffect(() => {
    if (!abTestStatus?.isRunning) return;

    const interval = setInterval(() => {
      fetchAbTestStatus();
    }, 500);

    return () => clearInterval(interval);
  }, [abTestStatus?.isRunning]);

  const fetchState = async () => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/servers`);
      if (!response.ok) {
        throw new Error('Gagal memuat data load balancer');
      }
      const data = await response.json();
      setServers(data.servers ?? []);
      setTotals(data.totals ?? {});
      setRecent(data.recentDispatches ?? []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAbTestStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ab-test/status`);
      if (response.ok) {
        const data = await response.json();
        setAbTestStatus(data);
      }
    } catch (err) {
      // Silently fail for status polling
    }
  };

  const sendTraffic = async (count) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/traffic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? 'Gagal mengirim trafik');
      }

      setServers(payload.servers ?? []);
      setTotals(payload.totals ?? {});
      setRecent(payload.recentDispatches ?? payload.dispatched ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateServer = async (id, patch) => {
    setUpdatingServer(id);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/servers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? 'Gagal mengubah server');
      }

      setServers(payload.servers ?? []);
      setTotals(payload.totals ?? {});
      setRecent(payload.recentDispatches ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingServer(null);
    }
  };

  const resetSimulation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/reset`, {
        method: 'POST',
      });
      const payload = await response.json();
      setServers(payload.servers ?? []);
      setTotals(payload.totals ?? {});
      setRecent(payload.recentDispatches ?? []);
    } catch (err) {
      setError('Tidak dapat mereset simulasi: backend belum berjalan?');
    } finally {
      setIsLoading(false);
    }
  };

  // A/B Testing Functions
  const runQuickSimulation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/ab-test/quick-sim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: quickSimCount,
          compareAlgorithm,
          simulateRealLatency: abConfig.simulateRealLatency,
          simulateErrors: abConfig.simulateErrors,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? 'Gagal menjalankan simulasi');
      }

      setQuickSimResults(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startAbTest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Configure first
      await fetch(`${API_BASE}/api/ab-test/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(abConfig),
      });

      // Then start
      const response = await fetch(`${API_BASE}/api/ab-test/start`, {
        method: 'POST',
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.message ?? 'Gagal memulai A/B test');
      }

      fetchAbTestStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const stopAbTest = async () => {
    try {
      await fetch(`${API_BASE}/api/ab-test/stop`, { method: 'POST' });
      fetchAbTestStatus();
    } catch (err) {
      setError('Gagal menghentikan test');
    }
  };

  const resetAbTest = async () => {
    try {
      await fetch(`${API_BASE}/api/ab-test/reset`, { method: 'POST' });
      fetchAbTestStatus();
      setQuickSimResults(null);
    } catch (err) {
      setError('Gagal mereset test');
    }
  };

  const distribution = servers.map((server) => {
    const served = server.stats?.served ?? 0;
    return {
      ...server,
      served,
      share: totalServed ? Math.round((served / totalServed) * 100) : 0,
      isDown: server.status !== 'up' || server.weight <= 0,
    };
  });

  const formattedRecent = recent.map((item) => ({
    ...item,
    time: item.at
      ? new Date(item.at).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : '-',
  }));

  // Calculate comparison metrics
  const comparisonMetrics = useMemo(() => {
    if (!quickSimResults) return null;

    const { groupA, groupB } = quickSimResults;
    const latencyDiff = groupA.stats.avgLatency - groupB.stats.avgLatency;
    const errorDiff = (groupA.stats.errorRate - groupB.stats.errorRate) * 100;

    return {
      latencyDiff,
      latencyWinner: latencyDiff < 0 ? 'A' : latencyDiff > 0 ? 'B' : 'tie',
      errorDiff,
      errorWinner: errorDiff < 0 ? 'A' : errorDiff > 0 ? 'B' : 'tie',
    };
  }, [quickSimResults]);

  return (
    <section className="lb-page">
      <div className="lb-hero">
        <div>
          <p className="eyebrow">Simulasi Infrastruktur</p>
          <h2>Load Balancer Weighted Round Robin</h2>
          <p className="section-subtitle">
            Backend Node/Express memproses trafik melalui algoritma load balancing.
            Jalankan simulasi untuk melihat distribusi permintaan ke setiap server.
          </p>
          <div className="pill-group">
            <span className="pill">API: {API_BASE}/api/traffic</span>
            <span className="pill pill--soft">
              {totals.activeTargets ?? 0} target aktif
            </span>
            <span className="pill pill--glow">
              {totals.requests ?? 0} permintaan
            </span>
          </div>
        </div>
        <div className="lb-hero-metrics">
          <div>
            <p>Algoritma Default</p>
            <strong>Weighted RR</strong>
            <span>{activeStats.activeCount} node siap menerima trafik</span>
          </div>
          <div>
            <p>Rata-rata bobot aktif</p>
            <strong>{activeStats.avgWeight}</strong>
            <span>
              Total request tercatat {totalServed.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="lb-tabs">
        <button
          type="button"
          className={`lb-tab ${activeTab === 'simulation' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulation')}
        >
          Simulasi Standar
        </button>
        <button
          type="button"
          className={`lb-tab ${activeTab === 'abtest' ? 'active' : ''}`}
          onClick={() => setActiveTab('abtest')}
        >
          A/B Testing
        </button>
      </div>

      {error && <div className="lb-alert">[!] {error}</div>}

      {activeTab === 'simulation' && (
        <div className="lb-grid">
          <div className="lb-panel lb-panel--control">
            <div className="lb-panel__header">
              <div>
                <p className="eyebrow">Kontrol Trafik</p>
                <h3>Routing ke load balancer</h3>
              </div>
              <button
                type="button"
                className="btn ghost"
                onClick={resetSimulation}
                disabled={isLoading}
              >
                Reset simulasi
              </button>
            </div>
            <div className="lb-control">
              <label htmlFor="request-count">Jumlah permintaan</label>
              <input
                id="request-count"
                type="number"
                min="1"
                max="200"
                value={customCount}
                onChange={(event) =>
                  setCustomCount(Math.max(1, Number(event.target.value) || 1))
                }
              />
              <button
                type="button"
                className="btn primary"
                onClick={() => sendTraffic(customCount)}
                disabled={isLoading}
              >
                Kirim {customCount} request
              </button>
            </div>
            <div className="lb-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => sendTraffic(1)}
                disabled={isLoading}
              >
                Kirim 1
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => sendTraffic(10)}
                disabled={isLoading}
              >
                Burst 10
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => sendTraffic(25)}
                disabled={isLoading}
              >
                Stress 25
              </button>
            </div>
            <div className="lb-metric-grid">
              <div className="lb-metric">
                <p>Total request</p>
                <strong>{totals.requests?.toLocaleString('id-ID') ?? 0}</strong>
                <span>Sejak simulasi terakhir</span>
              </div>
              <div className="lb-metric">
                <p>Server aktif</p>
                <strong>{totals.activeTargets ?? 0}</strong>
                <span>Hanya status up dengan bobot &gt; 0</span>
              </div>
              <div className="lb-metric">
                <p>Distribusi tercatat</p>
                <strong>{totalServed.toLocaleString('id-ID')}</strong>
                <span>Request yang berhasil diarahkan</span>
              </div>
            </div>
          </div>

          <div className="lb-panel lb-panel--distribution">
            <div className="lb-panel__header">
              <div>
                <p className="eyebrow">Distribusi</p>
                <h3>Berat vs realisasi</h3>
              </div>
              <button
                type="button"
                className="btn ghost"
                onClick={fetchState}
                disabled={isLoading}
              >
                Muat ulang
              </button>
            </div>
            <div className="lb-distribution">
              {distribution.map((server) => (
                <article key={server.id} className="lb-distribution__row">
                  <div className="lb-distribution__info">
                    <p className="eyebrow">{server.region}</p>
                    <div className="lb-distribution__title">
                      <strong>{server.label}</strong>
                      <span className="pill pill--soft">Bobot {server.weight}</span>
                    </div>
                    <p className="lb-distribution__meta">
                      Served {server.served.toLocaleString('id-ID')} req
                    </p>
                  </div>
                  <div className="lb-progress-wrap">
                    <div
                      className="lb-progress"
                      style={{ width: `${Math.min(server.share, 100)}%` }}
                      aria-label={`Kontribusi ${server.share}%`}
                    />
                    <span className="lb-progress__chip">{server.share}%</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="lb-panel lb-panel--full lb-panel--servers">
            <div className="lb-panel__header">
              <div>
                <p className="eyebrow">Pool Server</p>
                <h3>Atur bobot & status</h3>
              </div>
            </div>
            <div className="lb-servers">
              {servers.map((server) => (
                <article
                  key={server.id}
                  className={`lb-server ${server.status !== 'up' ? 'is-down' : ''}`}
                >
                  <div className="lb-server__header">
                    <div>
                      <p className="eyebrow">{server.region}</p>
                      <h4>{server.label}</h4>
                      <p className="server-host">{server.host}</p>
                    </div>
                    <span className={`pill ${server.status === 'up' ? 'pill--glow' : 'pill--soft'}`}>
                      {server.status === 'up' ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </div>
                  <p className="server-role">{server.role}</p>
                  <div className="lb-server__meta">
                    <div>
                      <p className="stat-label">Bobot</p>
                      <p className="stat-value">{server.weight}</p>
                    </div>
                    <div>
                      <p className="stat-label">Rata latency</p>
                      <p className="stat-value">
                        ~{server.latencyMs} ms
                      </p>
                    </div>
                    <div>
                      <p className="stat-label">Served</p>
                      <p className="stat-value">{server.stats?.served ?? 0}</p>
                    </div>
                  </div>
                  <div className="lb-server__controls">
                    <div className="weight-controls">
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() =>
                          updateServer(server.id, { weight: Math.max(0, server.weight - 1) })
                        }
                        disabled={updatingServer === server.id}
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => updateServer(server.id, { weight: server.weight + 1 })}
                        disabled={updatingServer === server.id}
                      >
                        +1
                      </button>
                    </div>
                    <button
                      type="button"
                      className={`btn ${server.status === 'up' ? 'secondary' : 'primary'}`}
                      onClick={() =>
                        updateServer(server.id, {
                          status: server.status === 'up' ? 'down' : 'up',
                        })
                      }
                      disabled={updatingServer === server.id}
                    >
                      {server.status === 'up' ? 'Matikan sementara' : 'Aktifkan kembali'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="lb-panel lb-panel--full lb-panel--log">
            <div className="lb-panel__header">
              <div>
                <p className="eyebrow">Log Dispatch</p>
                <h3>Urutan request terbaru</h3>
              </div>
            </div>
            <div className="lb-log">
              {formattedRecent.length === 0 && (
                <p className="section-subtitle">
                  Belum ada request. Kirim simulasi untuk melihat urutan server yang dipilih.
                </p>
              )}
              {formattedRecent.map((item) => (
                <div key={`${item.requestId}-${item.at}`} className="lb-log__row">
                  <div>
                    <p className="eyebrow">Request #{item.requestId}</p>
                    <strong>{item.serverLabel}</strong>
                    <span>{item.region}</span>
                  </div>
                  <div className="lb-log__meta">
                    <span className="pill pill--soft">{item.time}</span>
                    <span className="pill">~{item.latencyMs} ms</span>
                    <span className="pill pill--glow">Bobot {item.weight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'abtest' && (
        <div className="lb-grid lb-grid--abtest">
          {/* Quick Simulation Panel */}
          <div className="lb-panel lb-panel--full">
            <div className="lb-panel__header">
              <div>
                <p className="eyebrow">A/B Testing</p>
                <h3>Bandingkan Algoritma Load Balancing</h3>
                <p className="section-subtitle" style={{ marginTop: '8px' }}>
                  Jalankan simulasi untuk membandingkan performa Weighted Round Robin 
                  dengan algoritma lainnya secara real-time.
                </p>
              </div>
              <button
                type="button"
                className="btn ghost"
                onClick={resetAbTest}
                disabled={isLoading || abTestStatus?.isRunning}
              >
                Reset Test
              </button>
            </div>

            <div className="ab-config">
              <div className="ab-config__row">
                <div className="ab-config__field">
                  <label>Algoritma Pembanding</label>
                  <select
                    value={compareAlgorithm}
                    onChange={(e) => setCompareAlgorithm(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="simple-round-robin">Simple Round Robin</option>
                    <option value="random">Random Selection</option>
                  </select>
                </div>
                <div className="ab-config__field">
                  <label>Jumlah Request</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={quickSimCount}
                    onChange={(e) => setQuickSimCount(Math.max(10, Number(e.target.value) || 50))}
                    disabled={isLoading}
                  />
                </div>
                <div className="ab-config__field ab-config__field--checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={abConfig.simulateRealLatency}
                      onChange={(e) =>
                        setAbConfig({ ...abConfig, simulateRealLatency: e.target.checked })
                      }
                      disabled={isLoading}
                    />
                    Simulasi latency realistis
                  </label>
                </div>
                <div className="ab-config__field ab-config__field--checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={abConfig.simulateErrors}
                      onChange={(e) =>
                        setAbConfig({ ...abConfig, simulateErrors: e.target.checked })
                      }
                      disabled={isLoading}
                    />
                    Simulasi error rate
                  </label>
                </div>
              </div>
              <button
                type="button"
                className="btn primary"
                onClick={runQuickSimulation}
                disabled={isLoading}
              >
                {isLoading ? 'Menjalankan...' : `Jalankan Simulasi (${quickSimCount} requests)`}
              </button>
            </div>
          </div>

          {/* Results Comparison */}
          {quickSimResults && (
            <>
              {/* Summary Cards */}
              <div className="lb-panel lb-panel--full">
                <div className="lb-panel__header">
                  <div>
                    <p className="eyebrow">Hasil Perbandingan</p>
                    <h3>Weighted RR vs {quickSimResults.groupB.label}</h3>
                  </div>
                </div>

                {comparisonMetrics && (
                  <div className="ab-summary">
                    <div className={`ab-summary__card ${comparisonMetrics.latencyWinner === 'A' ? 'winner' : ''}`}>
                      <p className="eyebrow">Rata-rata Latency</p>
                      <div className="ab-summary__comparison">
                        <div className="ab-summary__value">
                          <strong>{quickSimResults.groupA.stats.avgLatency} ms</strong>
                          <span>Weighted RR</span>
                        </div>
                        <div className="ab-summary__vs">vs</div>
                        <div className="ab-summary__value">
                          <strong>{quickSimResults.groupB.stats.avgLatency} ms</strong>
                          <span>{quickSimResults.groupB.label}</span>
                        </div>
                      </div>
                      <p className="ab-summary__verdict">
                        {comparisonMetrics.latencyWinner === 'A' 
                          ? `Weighted RR ${Math.abs(comparisonMetrics.latencyDiff)} ms lebih cepat`
                          : comparisonMetrics.latencyWinner === 'B'
                            ? `${quickSimResults.groupB.label} ${Math.abs(comparisonMetrics.latencyDiff)} ms lebih cepat`
                            : 'Performa setara'}
                      </p>
                    </div>

                    <div className={`ab-summary__card ${comparisonMetrics.errorWinner === 'A' ? 'winner' : ''}`}>
                      <p className="eyebrow">Error Rate</p>
                      <div className="ab-summary__comparison">
                        <div className="ab-summary__value">
                          <strong>{(quickSimResults.groupA.stats.errorRate * 100).toFixed(1)}%</strong>
                          <span>Weighted RR</span>
                        </div>
                        <div className="ab-summary__vs">vs</div>
                        <div className="ab-summary__value">
                          <strong>{(quickSimResults.groupB.stats.errorRate * 100).toFixed(1)}%</strong>
                          <span>{quickSimResults.groupB.label}</span>
                        </div>
                      </div>
                      <p className="ab-summary__verdict">
                        {comparisonMetrics.errorWinner === 'A' 
                          ? `Weighted RR ${Math.abs(comparisonMetrics.errorDiff).toFixed(1)}% lebih rendah`
                          : comparisonMetrics.errorWinner === 'B'
                            ? `${quickSimResults.groupB.label} ${Math.abs(comparisonMetrics.errorDiff).toFixed(1)}% lebih rendah`
                            : 'Performa setara'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Stats Side by Side */}
              <div className="lb-panel ab-group ab-group--a">
                <div className="lb-panel__header">
                  <div>
                    <p className="eyebrow">Grup A</p>
                    <h3>Weighted Round Robin</h3>
                  </div>
                  <span className="pill pill--glow">Rekomendasi</span>
                </div>
                <div className="ab-stats">
                  <div className="ab-stat">
                    <span>Total Requests</span>
                    <strong>{quickSimResults.groupA.stats.totalRequests}</strong>
                  </div>
                  <div className="ab-stat">
                    <span>Avg Latency</span>
                    <strong>{quickSimResults.groupA.stats.avgLatency} ms</strong>
                  </div>
                  <div className="ab-stat">
                    <span>P95 Latency</span>
                    <strong>{quickSimResults.groupA.stats.p95Latency} ms</strong>
                  </div>
                  <div className="ab-stat">
                    <span>P99 Latency</span>
                    <strong>{quickSimResults.groupA.stats.p99Latency} ms</strong>
                  </div>
                  <div className="ab-stat">
                    <span>Min / Max</span>
                    <strong>{quickSimResults.groupA.stats.minLatency} / {quickSimResults.groupA.stats.maxLatency} ms</strong>
                  </div>
                  <div className="ab-stat">
                    <span>Errors</span>
                    <strong>{quickSimResults.groupA.stats.errors} ({(quickSimResults.groupA.stats.errorRate * 100).toFixed(1)}%)</strong>
                  </div>
                </div>

                <div className="ab-distribution">
                  <p className="eyebrow">Distribusi Server</p>
                  {Object.entries(quickSimResults.groupA.stats.distribution).map(([serverId, count]) => {
                    const server = servers.find(s => s.id === serverId) || { label: serverId };
                    const share = Math.round((count / quickSimResults.groupA.stats.totalRequests) * 100);
                    return (
                      <div key={serverId} className="ab-distribution__row">
                        <span>{server.label}</span>
                        <div className="ab-distribution__bar">
                          <div className="ab-distribution__fill" style={{ width: `${share}%` }} />
                        </div>
                        <strong>{share}%</strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lb-panel ab-group ab-group--b">
                <div className="lb-panel__header">
                  <div>
                    <p className="eyebrow">Grup B</p>
                    <h3>{quickSimResults.groupB.label}</h3>
                  </div>
                  <span className="pill pill--soft">Pembanding</span>
                </div>
                <div className="ab-stats">
                  <div className="ab-stat">
                    <span>Total Requests</span>
                    <strong>{quickSimResults.groupB.stats.totalRequests}</strong>
                  </div>
                  <div className="ab-stat">
                    <span>Avg Latency</span>
                    <strong>{quickSimResults.groupB.stats.avgLatency} ms</strong>
                  </div>
                  <div className="ab-stat">
                    <span>P95 Latency</span>
                    <strong>{quickSimResults.groupB.stats.p95Latency} ms</strong>
                  </div>
                  <div className="ab-stat">
                    <span>P99 Latency</span>
                    <strong>{quickSimResults.groupB.stats.p99Latency} ms</strong>
                  </div>
                  <div className="ab-stat">
                    <span>Min / Max</span>
                    <strong>{quickSimResults.groupB.stats.minLatency} / {quickSimResults.groupB.stats.maxLatency} ms</strong>
                  </div>
                  <div className="ab-stat">
                    <span>Errors</span>
                    <strong>{quickSimResults.groupB.stats.errors} ({(quickSimResults.groupB.stats.errorRate * 100).toFixed(1)}%)</strong>
                  </div>
                </div>

                <div className="ab-distribution">
                  <p className="eyebrow">Distribusi Server</p>
                  {Object.entries(quickSimResults.groupB.stats.distribution).map(([serverId, count]) => {
                    const server = servers.find(s => s.id === serverId) || { label: serverId };
                    const share = Math.round((count / quickSimResults.groupB.stats.totalRequests) * 100);
                    return (
                      <div key={serverId} className="ab-distribution__row">
                        <span>{server.label}</span>
                        <div className="ab-distribution__bar">
                          <div className="ab-distribution__fill ab-distribution__fill--alt" style={{ width: `${share}%` }} />
                        </div>
                        <strong>{share}%</strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Insight Panel */}
              <div className="lb-panel lb-panel--full ab-insight">
                <div className="lb-panel__header">
                  <div>
                    <p className="eyebrow">Analisis</p>
                    <h3>Mengapa Weighted Round Robin?</h3>
                  </div>
                </div>
                <div className="ab-insight__content">
                  <div className="ab-insight__point">
                    <div className="ab-insight__icon">⚖️</div>
                    <div>
                      <strong>Distribusi Proporsional</strong>
                      <p>Server dengan kapasitas lebih tinggi mendapat lebih banyak request, mengurangi overload pada server lemah.</p>
                    </div>
                  </div>
                  <div className="ab-insight__point">
                    <div className="ab-insight__icon">⚡</div>
                    <div>
                      <strong>Latency Optimal</strong>
                      <p>Dengan mengarahkan lebih banyak traffic ke server cepat (weight tinggi), rata-rata latency menjadi lebih rendah.</p>
                    </div>
                  </div>
                  <div className="ab-insight__point">
                    <div className="ab-insight__icon">🛡️</div>
                    <div>
                      <strong>Error Rate Lebih Rendah</strong>
                      <p>Server DR dengan kapasitas rendah tidak dibebani berlebihan, mengurangi kemungkinan timeout dan error.</p>
                    </div>
                  </div>
                  <div className="ab-insight__point">
                    <div className="ab-insight__icon">📊</div>
                    <div>
                      <strong>Predictable & Fair</strong>
                      <p>Berbeda dengan Random, distribusi WRR dapat diprediksi dan konsisten sesuai dengan konfigurasi weight.</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {!quickSimResults && (
            <div className="lb-panel lb-panel--full ab-empty">
              <div className="ab-empty__icon">🔬</div>
              <h3>Belum Ada Hasil</h3>
              <p>Jalankan simulasi A/B testing untuk melihat perbandingan performa antara algoritma load balancing.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
