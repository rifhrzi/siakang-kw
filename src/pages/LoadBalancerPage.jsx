import { useEffect, useState } from 'react';
import { useLoadBalancerApi } from '../hooks/useLoadBalancerApi';
import { MonitorTab, StatsTab, InfraTab, ABTestTab } from '../components/LoadBalancer';
import {
  userStats,
  features,
  peakTimes,
  infrastructure,
} from '../data/xyzStats';

/**
 * LoadBalancerPage - Main page for load balancer simulation
 * Refactored to use separate tab components for better maintainability
 */
export default function LoadBalancerPage() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [customCount, setCustomCount] = useState(10);

  const {
    servers,
    totals,
    recent,
    isLoading,
    updatingServer,
    error,
    quickSimResults,
    fetchState,
    sendTraffic,
    updateServer,
    resetSimulation,
    runQuickSimulation,
  } = useLoadBalancerApi();

  useEffect(() => {
    fetchState();
  }, [fetchState]);

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

      {/* Tab Content */}
      {activeTab === 'monitor' && (
        <MonitorTab
          servers={servers}
          totals={totals}
          recent={recent}
          isLoading={isLoading}
          updatingServer={updatingServer}
          fetchState={fetchState}
          updateServer={updateServer}
        />
      )}

      {activeTab === 'stats' && <StatsTab />}

      {activeTab === 'infra' && <InfraTab />}

      {activeTab === 'abtest' && (
        <ABTestTab
          servers={servers}
          isLoading={isLoading}
          quickSimResults={quickSimResults}
          runQuickSimulation={runQuickSimulation}
        />
      )}
    </>
  );
}
