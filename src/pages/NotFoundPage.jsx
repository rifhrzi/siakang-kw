import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="modules">
      <div className="section-header">
        <div>
          <p className="eyebrow">404</p>
          <h2>Halaman tidak ditemukan</h2>
        </div>
      </div>
      <p>Menu yang Anda cari belum tersedia di portal ini.</p>
      <Link className="btn primary" to="/">
        Kembali ke Dashboard
      </Link>
    </section>
  );
}
