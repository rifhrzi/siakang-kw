import { useMemo } from 'react';

/**
 * MonitorTab - Server monitoring and traffic simulation tab
 */
export default function MonitorTab({
    servers,
    totals,
    recent,
    isLoading,
    updatingServer,
    fetchState,
    updateServer,
}) {
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
    );
}
