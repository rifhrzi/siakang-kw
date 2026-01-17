import {
    userStats,
    features,
    peakTimes,
} from '../../data/xyzStats';

/**
 * StatsTab - XYZ Statistics display tab
 */
export default function StatsTab() {
    const quickStats = [
        { icon: '👨‍🎓', label: 'Total Mahasiswa', value: userStats.mahasiswa.total.toLocaleString('id-ID') },
        { icon: '✅', label: 'Mahasiswa Aktif', value: userStats.mahasiswa.aktif.toLocaleString('id-ID') },
        { icon: '👨‍🏫', label: 'Total Dosen', value: userStats.dosen.total.toLocaleString('id-ID') },
        { icon: '⚙️', label: 'Total Modul', value: `${features.totalModul} Modul` },
    ];

    return (
        <section className="XYZ-stats">
            {/* Quick Stats Cards */}
            <div className="cards-grid">
                {quickStats.map((stat) => (
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
    );
}
