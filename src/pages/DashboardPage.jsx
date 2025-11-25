import { Link } from 'react-router-dom';

export default function DashboardPage({ student, metrics }) {
  return (
    <>
      <section className="hero-card">
        <div className="hero-info">
          <div className="profile">
            <img src={student.photoUrl} alt="Foto mahasiswa" />
            <div>
              <p className="welcome">Selamat datang kembali,</p>
              <h1 className="student-name">{student.name}</h1>
              <p className="student-program">{student.programLabel}</p>
            </div>
          </div>
          <dl className="identity">
            {student.identitySummary.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="hero-cta">
          <p>
            Siapkan semester baru dengan memantau KRS, jadwal, dan tagihan
            secara terpadu.
          </p>
          <div className="cta-buttons">
            <Link className="btn primary" to="/praperkuliahan/krs">
              Kelola KRS
            </Link>
            <Link className="btn secondary" to="/tagihan">
              Lihat Tagihan
            </Link>
          </div>
        </div>
      </section>

      <section className="cards-grid" aria-label="Ringkasan akademik">
        {metrics.map((card) => (
          <article key={card.label} className={`info-card ${card.variantClass}`}>
            <p className="label">{card.label}</p>
            <p className="value">{card.value}</p>
            <p className="meta">{card.meta}</p>
          </article>
        ))}
      </section>
    </>
  );
}
