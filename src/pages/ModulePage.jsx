import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ModulePage({ section }) {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  if (!section) {
    return (
      <section className="modules module-page">
        <div className="module-page__hero">
          <div className="module-page__hero-text">
            <p className="eyebrow">Halaman tidak ditemukan</p>
            <h2>Konten tidak tersedia</h2>
            <p className="section-subtitle">
              Silakan pilih menu lain melalui navigasi.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const aggregatedStats = section.cards.flatMap((card) => card.stats ?? []);
  const heroStats = aggregatedStats.slice(0, 3);
  const summaryHighlight = section.cards.find((card) => card.highlight)?.highlight;
  const primaryActionLabel =
    section.cards[0]?.actionLabel ?? 'Lanjutkan Modul';
  const breadcrumbs = [
    { label: 'Dashboard', to: '/' },
    { label: section.title, to: null },
  ];

  const openMail = (subject = 'Permintaan modul', body = '') => {
    const mailto = `mailto:support@XYZ.local?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const downloadFile = (filename, content, mime = 'text/plain') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportScheduleCsv = (card) => {
    const headers = ['Hari', 'Mata Kuliah', 'Jam', 'Ruang/Kelas'];
    const rows = (card.schedule ?? []).map((item) => [
      item.day ?? '-',
      item.course ?? '-',
      item.time ?? '-',
      item.room ?? item.classroom ?? '-',
    ]);
    if (!rows.length) rows.push(['-', '-', '-', '-']);
    const toCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      headers.map(toCsvValue).join(','),
      ...rows.map((row) => row.map(toCsvValue).join(',')),
    ].join('\n');
    downloadFile('jadwal-perkuliahan.csv', csv, 'text/csv');
  };

  const exportTagihanCsv = (card) => {
    const headers = ['Label', 'Nilai'];
    const rows = (card.stats ?? []).map((stat) => [stat.label, stat.value]);
    const toCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      headers.map(toCsvValue).join(','),
      ...rows.map((row) => row.map(toCsvValue).join(',')),
    ].join('\n');
    downloadFile('tagihan-aktif.csv', csv, 'text/csv');
  };

  const exportHasilStudiTxt = (card) => {
    const lines = [
      `Rekap Nilai: ${card.title}`,
      `Aksi: ${card.actionLabel}`,
      '',
      'Highlight:',
      ...(card.features ?? ['Ringkasan nilai tersedia.']).map(
        (item) => `- ${item}`
      ),
    ];
    downloadFile('hasil-studi.txt', lines.join('\n'));
  };

  const actionHandlers = {
    'registrasi-card': () =>
      navigate('/praperkuliahan/registrasi?step=upload-bukti'),
    'krs-card': () => navigate('/praperkuliahan/krs?mode=edit'),
    'jadwal-card': (card) => exportScheduleCsv(card),
    'hasil-studi-card': (card) => exportHasilStudiTxt(card),
    'tugas-akhir-card': (card) =>
      openMail(
        `Koordinasi ${card.title}`,
        'Mohon jadwalkan sesi bimbingan dan unggah revisi terbaru.'
      ),
    'mahasiswa-keluar-card': (card) =>
      openMail(
        `Permohonan ${card.title}`,
        'Mohon sertakan alasan, jenis proses (wisuda/cuti/mutasi/pengunduran diri), dan dokumen pendukung.'
      ),
    'biodata-card': () => navigate('/data-dasar/biodata?edit=true'),
    'tagihan-card': (card) => exportTagihanCsv(card),
    'settings-card': () => navigate('/settings?tab=security'),
  };

  const handleAction = (card) => {
    if (!card) return;
    if (card.actionHref) {
      window.open(card.actionHref, '_blank', 'noopener');
      return;
    }

    const handler = actionHandlers[card.id];
    if (handler) {
      handler(card);
      return;
    }

    openMail(
      `Permintaan ${card.title ?? 'Modul'}`,
      `Saya ingin melanjutkan proses "${card.actionLabel ?? primaryActionLabel}".`
    );
  };

  return (
    <section className="modules module-page">
      <div className="module-breadcrumbs" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.label} className="module-breadcrumbs__item">
            {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label}
            {index < breadcrumbs.length - 1 && <span className="crumb-divider">›</span>}
          </span>
        ))}
      </div>

      <div className="module-page__hero">
        <div className="module-page__hero-surface">
          <div className="module-page__hero-header">
            <div className="pill-group">
              <span className="pill">{section.eyebrow}</span>
              <span className="pill pill--soft">
                {section.cards.length} modul tersedia
              </span>
            </div>
            {summaryHighlight && (
              <div className="module-page__hero-note">{summaryHighlight}</div>
            )}
          </div>

          <div className="module-page__hero-grid">
            <div className="module-page__hero-text">
              <p className="eyebrow">{section.eyebrow}</p>
              <h2>{section.title}</h2>
              {section.subtitle && (
                <p className="section-subtitle">{section.subtitle}</p>
              )}
              <div className="module-page__hero-actions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => handleAction(section.cards[0])}
                >
                  {primaryActionLabel}
                </button>
                {section.link && (
                  <a className="btn ghost" href={section.link.href}>
                    {section.link.label}
                  </a>
                )}
              </div>
            </div>

            {heroStats.length > 0 && (
              <ul className="module-page__hero-stats">
                {heroStats.map((stat, index) => (
                  <li key={`${stat.label}-${index}`}>
                    <div className="stat-indicator" aria-hidden="true" />
                    <div className="stat-copy">
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="module-page__layout">
        <div className="module-grid module-grid--detail">
          {section.cards.map((card) => (
            <article className="module-card" key={card.id}>
              <div className="module-card__header">
                <div>
                  <p className="eyebrow">{section.eyebrow}</p>
                  <h3>{card.title}</h3>
                </div>
                {card.highlight && (
                  <span className="pill pill--glow">{card.highlight}</span>
                )}
              </div>

              <p className="module-card__description">{card.description}</p>

              {card.stats?.length > 0 && (
                <div className="module-card__meta">
                  {card.stats.map((stat) => (
                    <div
                      className="module-card__meta-item"
                      key={`${card.id}-${stat.label}`}
                    >
                      <p className="stat-label">{stat.label}</p>
                      <p className="stat-value">{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {card.features?.length > 0 && (
                <div className="module-card__features">
                  <p className="module-card__caption">Fitur utama</p>
                  <div className="chip-set">
                    {card.features.map((feature) => (
                      <span className="chip" key={feature}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {card.schedule?.length > 0 && (
                <div className="module-card__schedule">
                  <p className="module-card__caption">Jadwal terdekat</p>
                  <div
                    className="schedule-table"
                    role="region"
                    aria-label="Tabel jadwal perkuliahan"
                  >
                    <table>
                      <thead>
                        <tr>
                          <th>Detail Perkuliahan</th>
                          <th>Hari</th>
                          <th>Jam</th>
                          <th>Kelas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {card.schedule.map((item) => {
                          const fallbackParts =
                            item.detail
                              ?.split(/·|•|–|—|-/)
                              .map((part) => part.trim()) ?? [];
                          const course = item.course ?? fallbackParts[0] ?? '-';
                          const time = item.time ?? fallbackParts[1] ?? '-';
                          const room = item.room ?? fallbackParts[2] ?? '-';

                          return (
                            <tr
                              key={`${card.id}-${item.day}-${course}-${time}`}
                            >
                              <td>{course}</td>
                              <td>{item.day ?? '-'}</td>
                              <td>{time}</td>
                              <td>{room}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="module-card__footer">
                <div className="module-card__footer-text">
                  <p>
                    {card.features?.[0] ?? 'Lanjutkan untuk membuka detail modul'}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn primary module-card__cta"
                  onClick={() => handleAction(card)}
                >
                  {card.actionLabel}
                </button>
              </div>
            </article>
          ))}
        </div>

        {aggregatedStats.length > 0 && (
          <aside className="module-sidebar" aria-label="Ringkasan cepat">
            <div className="module-sidebar__header">
              <div>
                <p className="eyebrow">Ringkasan cepat</p>
                <h4>Indikator utama</h4>
              </div>
              <span className="pill pill--soft">
                {aggregatedStats.length} item
              </span>
            </div>
            <p>
              Kumpulan indikator penting untuk memastikan progres modul berjalan
              baik.
            </p>
            <ul className="module-sidebar__stats">
              {aggregatedStats.map((stat, index) => (
                <li key={`${stat.label}-${index}`}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      {section.footerNote && (
        <p className="section-footer">{section.footerNote}</p>
      )}
    </section>
  );
}

