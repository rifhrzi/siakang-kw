import { infrastructure, peakTimes } from '../../data/xyzStats';

/**
 * InfraTab - Infrastructure information display tab
 */
export default function InfraTab() {
    return (
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
    );
}
