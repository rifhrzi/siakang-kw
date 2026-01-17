import { useState, useMemo } from 'react';
import {
    LatencyComparisonChart,
    ErrorRateComparisonChart,
    DistributionComparisonChart,
    OverallComparisonChart,
    downloadAllCharts,
} from '../ComparisonChart';

/**
 * ABTestTab - A/B Testing configuration and results display
 */
export default function ABTestTab({
    servers,
    isLoading,
    quickSimResults,
    runQuickSimulation,
}) {
    const [quickSimCount, setQuickSimCount] = useState(100);
    const [compareAlgorithm, setCompareAlgorithm] = useState('simple-round-robin');
    const [abConfig, setAbConfig] = useState({
        simulateRealLatency: true,
        simulateErrors: true,
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

    const handleRunSimulation = () => {
        runQuickSimulation({
            count: quickSimCount,
            compareAlgorithm,
            simulateRealLatency: abConfig.simulateRealLatency,
            simulateErrors: abConfig.simulateErrors,
        });
    };

    return (
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
                    <button type="button" className="btn primary" onClick={handleRunSimulation} disabled={isLoading}>
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
    );
}
