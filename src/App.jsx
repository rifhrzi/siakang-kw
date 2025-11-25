import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import LoadBalancerPage from './pages/LoadBalancerPage';
import ModulePage from './pages/ModulePage';
import NotFoundPage from './pages/NotFoundPage';
import { metricCards, sections, student } from './data/siteData';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              semesterLabel={student.semesterStatus}
              integrationLabel="Terhubung dengan Sistem Akademik Untirta"
            />
          }
        >
          <Route
            index
            element={<DashboardPage student={student} metrics={metricCards} />}
          />
          <Route
            path="praperkuliahan/registrasi"
            element={<ModulePage section={sections.registrasi} />}
          />
          <Route
            path="praperkuliahan/krs"
            element={<ModulePage section={sections.krs} />}
          />
          <Route
            path="perkuliahan/jadwal"
            element={<ModulePage section={sections.jadwal} />}
          />
          <Route
            path="perkuliahan/hasil-studi"
            element={<ModulePage section={sections.hasilStudi} />}
          />
          <Route
            path="tugas-akhir"
            element={<ModulePage section={sections.tugasAkhir} />}
          />
          <Route
            path="pascaperkuliahan/mahasiswa-keluar"
            element={<ModulePage section={sections.mahasiswaKeluar} />}
          />
          <Route
            path="data-dasar/biodata"
            element={<ModulePage section={sections.biodata} />}
          />
          <Route
            path="tagihan"
            element={<ModulePage section={sections.tagihan} />}
          />
          <Route
            path="settings"
            element={<ModulePage section={sections.settings} />}
          />
          <Route
            path="simulasi/load-balancer"
            element={<LoadBalancerPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
