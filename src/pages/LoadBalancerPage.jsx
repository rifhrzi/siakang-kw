import { useEffect, useMemo, useState } from 'react';
import {
  LatencyComparisonChart,
  ErrorRateComparisonChart,
  DistributionComparisonChart,
  OverallComparisonChart,
  downloadAllCharts,
} from '../components/ComparisonChart';
import {
  userStats,
  features,
  peakTimes,
  infrastructure,
  xyzSummary,
} from '../data/xyzStats';

const API_BASE = import.meta.env.VITE_LB_BASE_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:4000');

export default function LoadBalancerPage() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [servers, setServers] = useState([]);
  const [totals, setTotals] = useState({ requests: 0, activeTargets: 0 });
  const [recent, setRecent] = useState([]);
  const [customCount, setCustomCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingServer, setUpdatingServer] = useState(null);
  const [error, setError] = useState(null);

  // A/B Testing State
  const [quickSimCount, setQuickSimCount] = useState(100);
  const [quickSimResults, setQuickSimResults] = useState(null);
  const [compareAlgorithm, setCompareAlgorithm] = useState('simple-round-robin');
  const [abConfig, setAbConfig] = useState({
    simulateRealLatency: true,
    simulateErrors: true,
  });

  const totalServed = useMemo(
    () => servers.reduce((sum, server) => sum + (server.stats?.served ?? 0), 0),
    [servers]
  );

  const activeStats = useMemo(() => {
    const active = servers.filter(
      (server) => server.status === 'up' && server.weight > 0
    );
    const avgWeight = active.length
      ? active.reduce((sum, server) => sum + server.weight, 0) / active.length
      : 0;
    const totalWeight = active.reduce((sum, server) => sum + server.weight, 0);
    const avgLatency = active.length
      ? Math.round(active.reduce((sum, server) => sum + server.latencyMs, 0) / active.length)
      : 0;

    return { activeCount: active.length, avgWeight: avgWeight.toFixed(1), totalWeight, avgLatency };
  }, [servers]);

  useEffect(() => {
    fetchState();
  }, []);

  const fetchState = async () => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/servers`);
      if (!response.ok) throw new Error('Gagal memuat data load balancer');
      const data = await response.json();
      setServers(data.servers ?? []);
      setTotals(data.totals ?? {});
      setRecent(data.recentDispatches ?? []);
    } catch (err) {
      setError(err.message);
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
      if (!response.ok) throw new Error(payload?.message ?? 'Gagal mengirim trafik');
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
      if (!response.ok) throw new Error(payload?.message ?? 'Gagal mengubah server');
      setServers(payload.servers ?? []);
      setTotals(payload.totals ?? {});
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
      const response = await fetch(`${API_BASE}/api/reset`, { method: 'POST' });
      const payload = await response.json();
      setServers(payload.servers ?? []);
      setTotals(payload.totals ?? {});
      setRecent(payload.recentDispatches ?? []);
      setQuickSimResults(null);
    } catch (err) {
      setError('Tidak dapat mereset simulasi');
    } finally {
      setIsLoading(false);
    }
  };

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
      if (!response.ok) throw new Error(payload?.message ?? 'Gagal menjalankan simulasi');
      setQuickSimResults(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const distribution = servers.map((server) => {
    const served = server.stats?.served ?? 0;
    return {
      ...server,
      served,
      share: totalServed ? Math.round((served / totalServed) * 100) : 0,
      expectedShare: activeStats.totalWeight
        ? Math.round((server.weight / activeStats.totalWeight) * 100)
        : 0,
    };
  });

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

  // Metric cards data
  const metricCards = [
    {
      label: 'Total Request',
      value: totals.requests?.toLocaleString('id-ID') ?? '0',
      meta: 'Sejak simulasi terakhir',
      variantClass: '',
    },
    {
      label: 'Server Aktif',
      value: `${activeStats.activeCount} / ${servers.length}`,
      meta: 'Status up dengan bobot > 0',
      variantClass: activeStats.activeCount === servers.length ? 'success' : 'warning',
    },
    {
      label: 'Rata-rata Latency',
      value: `${activeStats.avgLatency} ms`,
      meta: 'Dari semua server aktif',
      variantClass: activeStats.avgLatency < 70 ? 'success' : 'warning',
    },
    {
      label: 'Total Bobot',
      value: activeStats.totalWeight,
      meta: `Rata-rata ${activeStats.avgWeight} per server`,
      variantClass: '',
    },
  ];

  return (
    <>
      {/* Hero Section - Dashboard Style */}
      <section className="hero-card">
        <div className="hero-info">
          <div className="profile">
            <div className="lb-icon-box">
              <span>⚖️</span>
            </div>
            <div>
              <p className="welcome">Simulasi Infrastruktur XYZ</p>
              <h1 className="student-name">Load Balancer WRR</h1>
              <p className="student-program">Weighted Round Robin Algorithm</p>
            </div>
          </div>
          <dl className="identity">
            <div>
              <dt>Total Mahasiswa</dt>
              <dd>{userStats.mahasiswa.total.toLocaleString('id-ID')}</dd>
            </div>
            <div>
              <dt>Total Dosen</dt>
              <dd>{userStats.dosen.total.toLocaleString('id-ID')}</dd>
            </div>
            <div>
              <dt>Total Fitur</dt>
              <dd>{features.totalModul} Modul</dd>
            </div>
            <div>
              <dt>Server Aktif</dt>
              <dd>{infrastructure.summary.serverProduksi} / {infrastructure.summary.totalServer}</dd>
            </div>
          </dl>
        </div>
        <div className="hero-cta">
          <p>
            Simulasi load balancer untuk sistem akademik dengan {userStats.mahasiswa.aktif.toLocaleString('id-ID')} mahasiswa aktif
            dan rata-rata {peakTimes.requestStats.avgPerHari.toLocaleString('id-ID')} request/hari.
          </p>
          <div className="lb-quick-control">
            <input
              type="number"
              min="1"
              value={customCount}
              onChange={(e) => setCustomCount(Math.max(1, Number(e.target.value) || 1))}
              placeholder="Jumlah request"
            />
            <button
              type="button"
              className="btn primary"
              onClick={() => sendTraffic(customCount)}
              disabled={isLoading}
            >
              {isLoading ? 'Mengirim...' : `Kirim ${customCount} Request`}
            </button>
          </div>
          <div className="cta-buttons">
            <button type="button" className="btn secondary" onClick={() => sendTraffic(1)} disabled={isLoading}>
              +1 Request
            </button>
            <button type="button" className="btn secondary" onClick={() => sendTraffic(50)} disabled={isLoading}>
              Burst 50
            </button>
            <button type="button" className="btn tertiary" onClick={resetSimulation} disabled={isLoading}>
              Reset
            </button>
          </div>
        </div>
      </section>

      {error && <div className="lb-alert">[!] {error}</div>}

      {/* Tab Navigation */}
      <div className="lb-tabs">
        <button
          type="button"
          className={`lb-tab ${activeTab === 'monitor' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitor')}
        >
          🖥️ Monitor & Simulasi
        </button>
        <button
          type="button"
          className={`lb-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistik XYZ
        </button>
        <button
          type="button"
          className={`lb-tab ${activeTab === 'infra' ? 'active' : ''}`}
          onClick={() => setActiveTab('infra')}
        >
          🏗️ Infrastruktur
        </button>
        <button
          type="button"
          className={`lb-tab ${activeTab === 'abtest' ? 'active' : ''}`}
          onClick={() => setActiveTab('abtest')}
        >
          🔬 A/B Testing
        </button>
      </div>

      {/* ==================== TAB: MONITOR ==================== */}
      {activeTab === 'monitor' && (
        <>
          {/* Metric Cards */}
          <section className="cards-grid" aria-label="Metrik Load Balancer">
            {metricCards.map((card) => (
              <article key={card.label} className={`info-card ${card.variantClass}`}>
                <p className="label">{card.label}</p>
                <p className="value">{card.value}</p>
                <p className="meta">{card.meta}</p>
              </article>
            ))}
          </section>

          {/* Server Pool & Distribution */}
          <section className="lb-dashboard-grid">
            <div className="lb-dash-panel">
              <div className="lb-dash-panel__header">
                <div>
                  <p className="eyebrow">Pool Server</p>
                  <h3>Konfigurasi & Status</h3>
                </div>
                <button type="button" className="btn ghost" onClick={fetchState} disabled={isLoading}>
                  Refresh
                </button>
              </div>
              <div className="lb-server-list">
                {servers.map((server) => (
                  <article
                    key={server.id}
                    className={`lb-server-card ${server.status !== 'up' ? 'is-down' : ''}`}
                  >
                    <div className="lb-server-card__header">
                      <div className="lb-server-card__info">
                        <span className="eyebrow">{server.region}</span>
                        <h4>{server.label}</h4>
                        <p className="lb-server-card__host">{server.host}</p>
                      </div>
                      <span className={`pill ${server.status === 'up' ? 'pill--glow' : 'pill--soft'}`}>
                        {server.status === 'up' ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </div>
                    <div className="lb-server-card__stats">
                      <div><span>Bobot</span><strong>{server.weight}</strong></div>
                      <div><span>Latency</span><strong>{server.latencyMs} ms</strong></div>
                      <div><span>Served</span><strong>{server.stats?.served ?? 0}</strong></div>
                    </div>
                    <div className="lb-server-card__actions">
                      <div className="weight-controls">
                        <button type="button" className="btn ghost" onClick={() => updateServer(server.id, { weight: Math.max(0, server.weight - 1) })} disabled={updatingServer === server.id}>-1</button>
                        <span className="weight-display">{server.weight}</span>
                        <button type="button" className="btn ghost" onClick={() => updateServer(server.id, { weight: server.weight + 1 })} disabled={updatingServer === server.id}>+1</button>
                      </div>
                      <button type="button" className={`btn ${server.status === 'up' ? 'secondary' : 'primary'}`} onClick={() => updateServer(server.id, { status: server.status === 'up' ? 'down' : 'up' })} disabled={updatingServer === server.id}>
                        {server.status === 'up' ? 'Matikan' : 'Aktifkan'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="lb-dash-panel">
              <div className="lb-dash-panel__header">
                <div>
                  <p className="eyebrow">Distribusi Traffic</p>
                  <h3>Aktual vs Expected</h3>
                </div>
              </div>
              <div className="lb-distribution-list">
                {distribution.map((server) => (
                  <div key={server.id} className="lb-dist-item">
                    <div className="lb-dist-item__header">
                      <div>
                        <strong>{server.label}</strong>
                        <span className="lb-dist-item__meta">Bobot {server.weight} • {server.served.toLocaleString('id-ID')} req</span>
                      </div>
                      <div className="lb-dist-item__percentages">
                        <span className="lb-dist-actual">{server.share}%</span>
                        <span className="lb-dist-expected">/ {server.expectedShare}%</span>
                      </div>
                    </div>
                    <div className="lb-dist-bar">
                      <div className="lb-dist-bar__expected" style={{ width: `${server.expectedShare}%` }} />
                      <div className="lb-dist-bar__actual" style={{ width: `${server.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="lb-recent">
                <p className="eyebrow">Request Terbaru</p>
                <div className="lb-recent-list">
                  {recent.slice(0, 5).map((item, idx) => (
                    <div key={`${item.requestId}-${idx}`} className="lb-recent-item">
                      <span className="lb-recent-id">#{item.requestId}</span>
                      <span className="lb-recent-server">{item.serverLabel}</span>
                      <span className="lb-recent-latency">{item.latencyMs} ms</span>
                    </div>
                  ))}
                  {recent.length === 0 && (
                    <p className="lb-recent-empty">Belum ada request. Kirim simulasi untuk memulai.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ==================== TAB: STATISTIK XYZ ==================== */}
      {activeTab === 'stats' && (
        <section className="XYZ-stats">
          {/* Quick Stats Cards */}
          <div className="cards-grid">
            {XYZSummary.quickStats.map((stat) => (
              <article key={stat.label} className="info-card">
                <p className="label">{stat.icon} {stat.label}</p>
                <p className="value">{stat.value}</p>
              </article>
            ))}
          </div>

          {/* User Statistics */}
          <div className="lb-dashboard-grid">
            <div className="lb-dash-panel">
              <div className="lb-dash-panel__header">
                <div>
                  <p className="eyebrow">👨‍🎓 Mahasiswa</p>
                  <h3>Statistik Pengguna</h3>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-box">
                  <span>Total Mahasiswa</span>
                  <strong>{userStats.mahasiswa.total.toLocaleString('id-ID')}</strong>
                </div>
                <div className="stat-box stat-box--success">
                  <span>Mahasiswa Aktif</span>
                  <strong>{userStats.mahasiswa.aktif.toLocaleString('id-ID')}</strong>
                </div>
                <div className="stat-box stat-box--warning">
                  <span>Mahasiswa Cuti</span>
                  <strong>{userStats.mahasiswa.cuti.toLocaleString('id-ID')}</strong>
                </div>
                <div className="stat-box">
                  <span>Non-Aktif</span>
                  <strong>{userStats.mahasiswa.nonAktif.toLocaleString('id-ID')}</strong>
                </div>
              </div>

              <div className="stats-section">
                <p className="eyebrow">Distribusi per Jenjang</p>
                <div className="stats-bars">
                  <div className="stat-bar-item">
                    <div className="stat-bar-label"><span>S1 (Sarjana)</span><strong>{userStats.mahasiswa.breakdown.s1.toLocaleString('id-ID')}</strong></div>
                    <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '85.96%' }} /></div>
                  </div>
                  <div className="stat-bar-item">
                    <div className="stat-bar-label"><span>S2 (Magister)</span><strong>{userStats.mahasiswa.breakdown.s2.toLocaleString('id-ID')}</strong></div>
                    <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '9.61%' }} /></div>
                  </div>
                  <div className="stat-bar-item">
                    <div className="stat-bar-label"><span>D3 (Diploma)</span><strong>{userStats.mahasiswa.breakdown.d3.toLocaleString('id-ID')}</strong></div>
                    <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '3.04%' }} /></div>
                  </div>
                  <div className="stat-bar-item">
                    <div className="stat-bar-label"><span>S3 (Doktor)</span><strong>{userStats.mahasiswa.breakdown.s3.toLocaleString('id-ID')}</strong></div>
                    <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '1.39%' }} /></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lb-dash-panel">
              <div className="lb-dash-panel__header">
                <div>
                  <p className="eyebrow">👨‍🏫 Dosen & Staff</p>
                  <h3>Tenaga Pengajar</h3>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-box">
                  <span>Total Dosen</span>
                  <strong>{userStats.dosen.total.toLocaleString('id-ID')}</strong>
                </div>
                <div className="stat-box stat-box--success">
                  <span>Dosen Tetap</span>
                  <strong>{userStats.dosen.tetap.toLocaleString('id-ID')}</strong>
                </div>
                <div className="stat-box">
                  <span>Dosen Tidak Tetap</span>
                  <strong>{userStats.dosen.tidakTetap.toLocaleString('id-ID')}</strong>
                </div>
                <div className="stat-box">
                  <span>Staff Akademik</span>
                  <strong>{userStats.staff.total.toLocaleString('id-ID')}</strong>
                </div>
              </div>

              <div className="stats-section">
                <p className="eyebrow">Jabatan Fungsional</p>
                <div className="stats-bars">
                  <div className="stat-bar-item">
                    <div className="stat-bar-label"><span>Profesor</span><strong>{userStats.dosen.breakdown.profesor}</strong></div>
                    <div className="stat-bar"><div className="stat-bar-fill stat-bar-fill--gold" style={{ width: '3.77%' }} /></div>
                  </div>
                  <div className="stat-bar-item">
                    <div className="stat-bar-label"><span>Lektor Kepala</span><strong>{userStats.dosen.breakdown.lektorKepala}</strong></div>
                    <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '18.76%' }} /></div>
                  </div>
                  <div className="stat-bar-item">
                    <div className="stat-bar-label"><span>Lektor</span><strong>{userStats.dosen.breakdown.lektor}</strong></div>
                    <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '31.20%' }} /></div>
                  </div>
                  <div className="stat-bar-item">
                    <div className="stat-bar-label"><span>Asisten Ahli</span><strong>{userStats.dosen.breakdown.asisten}</strong></div>
                    <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '46.27%' }} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fakultas Table */}
          <div className="lb-dash-panel lb-dash-panel--full">
            <div className="lb-dash-panel__header">
              <div>
                <p className="eyebrow">🏛️ Distribusi per Fakultas</p>
                <h3>Mahasiswa & Dosen</h3>
              </div>
            </div>
            <div className="stats-table-wrapper">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Fakultas</th>
                    <th>Kode</th>
                    <th>Mahasiswa</th>
                    <th>Dosen</th>
                    <th>Rasio</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.mahasiswa.perFakultas.map((fak, idx) => {
                    const dosenFak = userStats.dosen.perFakultas[idx];
                    const rasio = Math.round(fak.jumlah / dosenFak.jumlah);
                    return (
                      <tr key={fak.kode}>
                        <td>{fak.nama}</td>
                        <td><span className="pill pill--soft">{fak.kode}</span></td>
                        <td><strong>{fak.jumlah.toLocaleString('id-ID')}</strong></td>
                        <td>{dosenFak.jumlah}</td>
                        <td>{rasio}:1</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Features & Peak Times */}
          <div className="lb-dashboard-grid">
            <div className="lb-dash-panel">
              <div className="lb-dash-panel__header">
                <div>
                  <p className="eyebrow">⚙️ Fitur XYZ</p>
                  <h3>{features.totalModul} Total Modul</h3>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-box">
                  <span>Fitur Mahasiswa</span>
                  <strong>{features.mahasiswa.length}</strong>
                </div>
                <div className="stat-box">
                  <span>Fitur Dosen</span>
                  <strong>{features.dosen.length}</strong>
                </div>
                <div className="stat-box stat-box--success">
                  <span>Akses Normal/Hari</span>
                  <strong>{features.totalAksesHarian.normal.toLocaleString('id-ID')}</strong>
                </div>
                <div className="stat-box stat-box--warning">
                  <span>Akses Peak/Hari</span>
                  <strong>{features.totalAksesHarian.peakSeason.toLocaleString('id-ID')}</strong>
                </div>
              </div>

              <div className="stats-section">
                <p className="eyebrow">Top 5 Fitur Mahasiswa</p>
                <div className="feature-list">
                  {features.mahasiswa.slice(0, 5).map((f, idx) => (
                    <div key={f.nama} className="feature-item">
                      <span className="feature-rank">{idx + 1}</span>
                      <div className="feature-info">
                        <strong>{f.nama}</strong>
                        <span>{f.avgAksesHarian.toLocaleString('id-ID')} akses/hari</span>
                      </div>
                      <span className={`pill ${f.akses === 'Tinggi' ? 'pill--glow' : f.akses === 'Peak Season' ? 'pill--warning' : 'pill--soft'}`}>{f.akses}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lb-dash-panel">
              <div className="lb-dash-panel__header">
                <div>
                  <p className="eyebrow">⏰ Peak Time</p>
                  <h3>Jam & Season Sibuk</h3>
                </div>
              </div>

              <div className="stats-section">
                <p className="eyebrow">Jam Sibuk Harian</p>
                <div className="peak-time-list">
                  {peakTimes.harian.filter(p => p.load >= 60).map((p) => (
                    <div key={p.jam} className="peak-time-item">
                      <span className="peak-time-hour">{p.jam}</span>
                      <div className="peak-time-bar">
                        <div className="peak-time-fill" style={{ width: `${p.load}%` }} />
                      </div>
                      <span className="peak-time-load">{p.load}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stats-section">
                <p className="eyebrow">Peak Season Tahunan</p>
                <div className="season-list">
                  {peakTimes.seasonal.slice(0, 4).map((s) => (
                    <div key={s.periode} className="season-item">
                      <div className="season-info">
                        <strong>{s.periode}</strong>
                        <span>{s.bulan} • {s.durasiHari} hari</span>
                      </div>
                      <div className="season-stats">
                        <span className="pill pill--warning">{s.loadMultiplier}x load</span>
                        <span className="season-requests">{s.estimasiRequest.toLocaleString('id-ID')} req</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== TAB: INFRASTRUKTUR ==================== */}
      {activeTab === 'infra' && (
        <section className="XYZ-infra">
          {/* Infrastructure Summary Cards */}
          <div className="cards-grid">
            <article className="info-card">
              <p className="label">🖥️ Total Server</p>
              <p className="value">{infrastructure.summary.totalServer}</p>
              <p className="meta">{infrastructure.summary.serverProduksi} produksi, {infrastructure.summary.serverDR} DR</p>
            </article>
            <article className="info-card">
              <p className="label">⚡ Total CPU</p>
              <p className="value">{infrastructure.summary.totalCPUCore} Core</p>
              <p className="meta">Distributed across servers</p>
            </article>
            <article className="info-card">
              <p className="label">💾 Total RAM</p>
              <p className="value">{infrastructure.summary.totalRAM}</p>
              <p className="meta">High-performance memory</p>
            </article>
            <article className="info-card">
              <p className="label">📦 Total Storage</p>
              <p className="value">{infrastructure.summary.totalStorage}</p>
              <p className="meta">SSD/NVMe storage</p>
            </article>
          </div>

          {/* Server List */}
          <div className="lb-dash-panel lb-dash-panel--full">
            <div className="lb-dash-panel__header">
              <div>
                <p className="eyebrow">🏗️ Daftar Server</p>
                <h3>Infrastruktur XYZ</h3>
              </div>
            </div>
            <div className="stats-table-wrapper">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Server</th>
                    <th>Tipe</th>
                    <th>Lokasi</th>
                    <th>Spesifikasi</th>
                    <th>Fungsi</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {infrastructure.servers.map((server) => (
                    <tr key={server.id}>
                      <td><strong>{server.nama}</strong></td>
                      <td><span className="pill pill--soft">{server.tipe}</span></td>
                      <td>{server.lokasi}</td>
                      <td className="spec-cell">
                        {server.spesifikasi.cpu}, {server.spesifikasi.ram}
                        {server.spesifikasi.storage && `, ${server.spesifikasi.storage}`}
                      </td>
                      <td>{server.fungsi}</td>
                      <td>
                        <span className={`pill ${server.status === 'active' ? 'pill--glow' : 'pill--soft'}`}>
                          {server.status === 'active' ? 'Aktif' : 'Standby'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monitoring & SLA */}
          <div className="lb-dashboard-grid">
            <div className="lb-dash-panel">
              <div className="lb-dash-panel__header">
                <div>
                  <p className="eyebrow">📈 Monitoring</p>
                  <h3>Tools & Metrik</h3>
                </div>
              </div>
              <div className="monitoring-tools">
                {infrastructure.monitoring.tools.map((tool) => (
                  <span key={tool} className="pill">{tool}</span>
                ))}
              </div>
              <div className="stats-section">
                <p className="eyebrow">Metrik yang Dipantau</p>
                <div className="metrics-list">
                  {infrastructure.monitoring.metrics.map((metric) => (
                    <div key={metric} className="metric-item">✓ {metric}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lb-dash-panel">
              <div className="lb-dash-panel__header">
                <div>
                  <p className="eyebrow">🎯 SLA & Performance</p>
                  <h3>Service Level Agreement</h3>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-box">
                  <span>Target Uptime</span>
                  <strong>{infrastructure.monitoring.uptimeSLA}</strong>
                </div>
                <div className="stat-box stat-box--success">
                  <span>Actual Uptime</span>
                  <strong>{infrastructure.monitoring.actualUptime}</strong>
                </div>
              </div>
              <div className="stats-section">
                <p className="eyebrow">Request Statistics</p>
                <div className="stats-grid">
                  <div className="stat-box">
                    <span>Avg/Hari</span>
                    <strong>{peakTimes.requestStats.avgPerHari.toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="stat-box stat-box--warning">
                    <span>Peak/Hari</span>
                    <strong>{peakTimes.requestStats.peakPerHari.toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="stat-box">
                    <span>Avg/Detik</span>
                    <strong>{peakTimes.requestStats.avgPerDetik}</strong>
                  </div>
                  <div className="stat-box stat-box--warning">
                    <span>Peak/Detik</span>
                    <strong>{peakTimes.requestStats.peakPerDetik}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== TAB: A/B TESTING ==================== */}
      {activeTab === 'abtest' && (
        <section className="lb-comparison-section">
          <div className="lb-dash-panel lb-dash-panel--full">
            <div className="lb-dash-panel__header">
              <div>
                <p className="eyebrow">A/B Testing</p>
                <h3>Bandingkan Algoritma Load Balancing</h3>
                <p className="section-subtitle">
                  Jalankan simulasi untuk membandingkan performa WRR dengan algoritma lainnya.
                </p>
              </div>
            </div>

            <div className="lb-comparison-config">
              <div className="lb-config-field">
                <label>Algoritma Pembanding</label>
                <select value={compareAlgorithm} onChange={(e) => setCompareAlgorithm(e.target.value)} disabled={isLoading}>
                  <option value="simple-round-robin">Simple Round Robin</option>
                  <option value="random">Random Selection</option>
                </select>
              </div>
              <div className="lb-config-field">
                <label>Jumlah Request</label>
                <input type="number" min="1" value={quickSimCount} onChange={(e) => setQuickSimCount(Math.max(1, Number(e.target.value) || 100))} disabled={isLoading} />
              </div>
              <div className="lb-config-checkbox">
                <label>
                  <input type="checkbox" checked={abConfig.simulateRealLatency} onChange={(e) => setAbConfig({ ...abConfig, simulateRealLatency: e.target.checked })} />
                  Latency Realistis
                </label>
              </div>
              <div className="lb-config-checkbox">
                <label>
                  <input type="checkbox" checked={abConfig.simulateErrors} onChange={(e) => setAbConfig({ ...abConfig, simulateErrors: e.target.checked })} />
                  Simulasi Error
                </label>
              </div>
              <button type="button" className="btn primary" onClick={runQuickSimulation} disabled={isLoading}>
                {isLoading ? 'Running...' : `Jalankan ${quickSimCount} Request`}
              </button>
            </div>

            {quickSimResults && comparisonMetrics && (
              <div className="lb-comparison-results">
                <div className="lb-comparison-summary">
                  <div className={`lb-summary-card ${comparisonMetrics.latencyWinner === 'A' ? 'winner' : ''}`}>
                    <p className="eyebrow">Rata-rata Latency</p>
                    <div className="lb-summary-vs">
                      <div className="lb-summary-value">
                        <strong>{quickSimResults.groupA.stats.avgLatency} ms</strong>
                        <span>Weighted RR</span>
                      </div>
                      <span className="lb-vs-badge">vs</span>
                      <div className="lb-summary-value">
                        <strong>{quickSimResults.groupB.stats.avgLatency} ms</strong>
                        <span>{quickSimResults.groupB.label}</span>
                      </div>
                    </div>
                    <p className="lb-summary-verdict">
                      {comparisonMetrics.latencyWinner === 'A' ? `WRR ${Math.abs(comparisonMetrics.latencyDiff)} ms lebih cepat ✓` : comparisonMetrics.latencyWinner === 'B' ? `${quickSimResults.groupB.label} ${Math.abs(comparisonMetrics.latencyDiff)} ms lebih cepat` : 'Performa setara'}
                    </p>
                  </div>
                  <div className={`lb-summary-card ${comparisonMetrics.errorWinner === 'A' ? 'winner' : ''}`}>
                    <p className="eyebrow">Error Rate</p>
                    <div className="lb-summary-vs">
                      <div className="lb-summary-value">
                        <strong>{(quickSimResults.groupA.stats.errorRate * 100).toFixed(1)}%</strong>
                        <span>Weighted RR</span>
                      </div>
                      <span className="lb-vs-badge">vs</span>
                      <div className="lb-summary-value">
                        <strong>{(quickSimResults.groupB.stats.errorRate * 100).toFixed(1)}%</strong>
                        <span>{quickSimResults.groupB.label}</span>
                      </div>
                    </div>
                    <p className="lb-summary-verdict">
                      {comparisonMetrics.errorWinner === 'A' ? `WRR ${Math.abs(comparisonMetrics.errorDiff).toFixed(1)}% lebih rendah ✓` : comparisonMetrics.errorWinner === 'B' ? `${quickSimResults.groupB.label} ${Math.abs(comparisonMetrics.errorDiff).toFixed(1)}% lebih rendah` : 'Performa setara'}
                    </p>
                  </div>
                </div>

                <div className="lb-comparison-detail">
                  <div className="lb-detail-group lb-detail-group--a">
                    <h4><span className="lb-group-badge lb-group-badge--a">A</span>Weighted Round Robin</h4>
                    <div className="lb-detail-stats">
                      <div><span>P95 Latency</span><strong>{quickSimResults.groupA.stats.p95Latency} ms</strong></div>
                      <div><span>P99 Latency</span><strong>{quickSimResults.groupA.stats.p99Latency} ms</strong></div>
                      <div><span>Min/Max</span><strong>{quickSimResults.groupA.stats.minLatency}/{quickSimResults.groupA.stats.maxLatency} ms</strong></div>
                      <div><span>Errors</span><strong>{quickSimResults.groupA.stats.errors}</strong></div>
                    </div>
                  </div>
                  <div className="lb-detail-group lb-detail-group--b">
                    <h4><span className="lb-group-badge lb-group-badge--b">B</span>{quickSimResults.groupB.label}</h4>
                    <div className="lb-detail-stats">
                      <div><span>P95 Latency</span><strong>{quickSimResults.groupB.stats.p95Latency} ms</strong></div>
                      <div><span>P99 Latency</span><strong>{quickSimResults.groupB.stats.p99Latency} ms</strong></div>
                      <div><span>Min/Max</span><strong>{quickSimResults.groupB.stats.minLatency}/{quickSimResults.groupB.stats.maxLatency} ms</strong></div>
                      <div><span>Errors</span><strong>{quickSimResults.groupB.stats.errors}</strong></div>
                    </div>
                  </div>
                </div>

                <div className="lb-charts-section">
                  <div className="lb-charts-header">
                    <h4>Visualisasi Perbandingan</h4>
                    <button type="button" className="btn secondary" onClick={downloadAllCharts}>📥 Unduh Semua Chart</button>
                  </div>
                  <div className="lb-charts-grid">
                    <div className="lb-chart-card"><LatencyComparisonChart groupA={quickSimResults.groupA} groupB={quickSimResults.groupB} /></div>
                    <div className="lb-chart-card"><ErrorRateComparisonChart groupA={quickSimResults.groupA} groupB={quickSimResults.groupB} /></div>
                    <div className="lb-chart-card lb-chart-card--wide"><DistributionComparisonChart groupA={quickSimResults.groupA} groupB={quickSimResults.groupB} servers={servers} /></div>
                    <div className="lb-chart-card lb-chart-card--wide"><OverallComparisonChart groupA={quickSimResults.groupA} groupB={quickSimResults.groupB} /></div>
                  </div>
                </div>
              </div>
            )}

            {!quickSimResults && (
              <div className="lb-empty-state">
                <span className="lb-empty-icon">🔬</span>
                <h4>Belum Ada Hasil</h4>
                <p>Jalankan simulasi A/B testing untuk melihat perbandingan performa algoritma.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}


