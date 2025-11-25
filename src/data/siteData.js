import { Student } from '../models/Student';
import { MetricCard } from '../models/MetricCard';
import { Section } from '../models/Section';

export const student = new Student({
  name: 'Dewi Nur Aisyah',
  nim: '1203210045',
  program: 'Informatika',
  faculty: 'Fakultas Teknik',
  batch: '2021',
  status: 'Aktif',
  advisor: 'Dr. Budi Santosa',
  photoUrl:
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=facearea&w=200&h=200&q=80',
  semesterStatus: 'Semester Aktif · 2025/2026 Gasal',
});

export const metricCards = [
  new MetricCard({
    label: 'Total SKS Diambil',
    value: '22 SKS',
    meta: '4 Mata Kuliah inti, 2 pilihan',
  }),
  new MetricCard({
    label: 'IPK / IPS Terakhir',
    value: '3.68 / 3.72',
    meta: 'Kinerja sangat baik',
  }),
  new MetricCard({
    label: 'Tagihan Aktif',
    value: 'Rp 3.200.000',
    meta: 'Jatuh tempo 12 Sep 2025',
    variant: 'warning',
  }),
  new MetricCard({
    label: 'Status Registrasi',
    value: 'Terverifikasi',
    meta: 'Pembayaran UKT dikonfirmasi',
    variant: 'success',
  }),
];

export const navSections = [
  {
    heading: 'Dashboard Akademik',
    links: [{ label: 'Dashboard', to: '/' }],
  },
  {
    heading: 'PRAPERKULIAHAN',
    links: [
      { label: 'Registrasi', to: '/praperkuliahan/registrasi' },
      { label: 'Rencana Studi (KRS)', to: '/praperkuliahan/krs' },
    ],
  },
  {
    heading: 'PERKULIAHAN',
    links: [
      { label: 'Jadwal Perkuliahan', to: '/perkuliahan/jadwal' },
      { label: 'Hasil Studi', to: '/perkuliahan/hasil-studi' },
    ],
  },
  {
    heading: 'TUGAS AKHIR',
    links: [{ label: 'Menu Tugas Akhir', to: '/tugas-akhir' }],
  },
  {
    heading: 'PASCAPERKULIAHAN',
    links: [{ label: 'Mahasiswa Keluar', to: '/pascaperkuliahan/mahasiswa-keluar' }],
  },
  {
    heading: 'DATA DASAR',
    links: [{ label: 'Biodata Mahasiswa', to: '/data-dasar/biodata' }],
  },
  {
    heading: 'TAGIHAN',
    links: [{ label: 'Tagihan Mahasiswa', to: '/tagihan' }],
  },
  {
    heading: 'SIMULASI INFRA',
    links: [{ label: 'Load Balancer', to: '/simulasi/load-balancer' }],
  },
  {
    heading: 'System Setting',
    links: [{ label: 'Pengaturan Portal', to: '/settings' }],
  },
];

export const sections = {
  registrasi: new Section({
    id: 'registrasi',
    eyebrow: 'Praperkuliahan',
    title: 'Registrasi Semester',
    subtitle: 'Lengkapi verifikasi administrasi sebelum perkuliahan dimulai.',
    cards: [
      {
        id: 'registrasi-card',
        title: 'Registrasi Semester',
        description:
          'Pastikan dokumen akademik dan bukti pembayaran UKT telah tersinkron dengan fakultas.',
        features: [
          'Upload bukti bayar UKT',
          'Monitoring status verifikasi',
          'Integrasi persetujuan fakultas',
        ],
        stats: [
          { label: 'Tahap', value: 'Validasi Fakultas' },
          { label: 'Deadline', value: '05 Sep 2025' },
        ],
        actionLabel: 'Mulai Registrasi',
      },
    ],
  }),
  krs: new Section({
    id: 'krs',
    eyebrow: 'Praperkuliahan',
    title: 'Rencana Studi (KRS)',
    subtitle:
      'Atur pemilihan mata kuliah dan validasi dosen pembimbing akademik secara daring.',
    cards: [
      {
        id: 'krs-card',
        title: 'Rencana Studi (KRS)',
        description:
          'Susun rencana studi, cek ketersediaan kelas, dan hindari bentrok jadwal secara otomatis.',
        features: [
          'Integrasi kuota kelas realtime',
          'Simulasi bentrok jadwal otomatis',
          'Riwayat persetujuan dosen PA',
        ],
        stats: [
          { label: 'SKS Maksimal', value: '24' },
          { label: 'SKS Saat Ini', value: '22' },
        ],
        actionLabel: 'Susun KRS',
      },
    ],
  }),
  jadwal: new Section({
    id: 'jadwal',
    eyebrow: 'Perkuliahan',
    title: 'Jadwal Perkuliahan',
    subtitle: 'Sinkronkan jadwal kelas ke kalender favorit Anda.',
    cards: [
      {
        id: 'jadwal-card',
        title: 'Jadwal Mingguan',
        description:
          'Lengkap dengan lokasi ruang, mode perkuliahan, dan opsi sinkronisasi kalender.',
        schedule: [
          {
            day: 'Senin',
            course: 'Struktur Data',
            time: '08:00 - 09:40',
            room: 'R401',
          },
          {
            day: 'Selasa',
            course: 'Pemrograman Web',
            time: '10:00 - 12:00',
            room: 'Lab 2',
          },
          {
            day: 'Kamis',
            course: 'Sistem Operasi',
            time: '13:00 - 15:00',
            room: 'Ruang Hybrid',
          },
        ],
        features: [
          'Notifikasi pengingat otomatis',
          'Integrasi Google & Outlook Calendar',
        ],
        actionLabel: 'Selaraskan Kalender',
      },
    ],
  }),
  hasilStudi: new Section({
    id: 'hasil-studi',
    eyebrow: 'Perkuliahan',
    title: 'Hasil Studi',
    subtitle: 'Monitor perkembangan nilai untuk setiap mata kuliah.',
    cards: [
      {
        id: 'hasil-studi-card',
        title: 'Rekap Nilai',
        description:
          'Dapatkan ringkasan nilai per mata kuliah beserta rekomendasi peningkatan.',
        features: [
          'Grafik IP per semester',
          'Insight rekomendasi belajar',
          'Unduh transkrip sementara',
        ],
        actionLabel: 'Lihat Nilai',
      },
    ],
  }),
  tugasAkhir: new Section({
    id: 'tugas-akhir',
    eyebrow: 'Tugas Akhir',
    title: 'Menu Tugas Akhir',
    subtitle: 'Koordinasikan proposal, seminar, dan sidang dengan transparan.',
    cards: [
      {
        id: 'tugas-akhir-card',
        title: 'Progress Skripsi',
        description:
          'Pantau jadwal pembimbing, unggah revisi, dan kelola administrasi sidang.',
        features: [
          'Penjadwalan pembimbing otomatis',
          'Checklist progres per bab',
          'Notifikasi jadwal seminar',
        ],
        actionLabel: 'Masuk Menu TA',
      },
    ],
  }),
  mahasiswaKeluar: new Section({
    id: 'mahasiswa-keluar',
    eyebrow: 'Pascaperkuliahan',
    title: 'Mahasiswa Keluar',
    subtitle:
      'Kelola proses wisuda, cuti, mutasi, atau pengunduran diri melalui satu jalur.',
    cards: [
      {
        id: 'mahasiswa-keluar-card',
        title: 'Portal Mahasiswa Keluar',
        description:
          'Pantau checklist kelulusan dan dokumen administrasi akhir studi.',
        features: [
          'Checklist kelulusan terintegrasi',
          'Pemantauan berkas per fakultas',
        ],
        actionLabel: 'Ajukan Proses',
      },
    ],
  }),
  biodata: new Section({
    id: 'biodata',
    eyebrow: 'Data Dasar',
    title: 'Biodata Mahasiswa',
    subtitle: 'Perbarui informasi pribadi, kontak darurat, dan dokumen resmi.',
    cards: [
      {
        id: 'biodata-card',
        title: 'Profil Akademik',
        description:
          'Tersambung dengan Dukcapil & PDDikti untuk validasi data secara berkala.',
        features: [
          'Histori perubahan biodata',
          'Verifikasi dokumen otomatis',
        ],
        actionLabel: 'Perbarui Biodata',
      },
    ],
  }),
  tagihan: new Section({
    id: 'tagihan',
    eyebrow: 'Keuangan',
    title: 'Tagihan Mahasiswa',
    subtitle: 'Kelola pembayaran UKT, praktikum, dan kewajiban lainnya.',
    cards: [
      {
        id: 'tagihan-card',
        title: 'Status Tagihan',
        description:
          'Ringkasan biaya aktif beserta metode pembayaran yang tersedia.',
        highlight: 'Total Tagihan Aktif · Rp 3.200.000 · Jatuh tempo 12 Sep 2025',
        features: ['QRIS dan Virtual Account', 'Notifikasi jatuh tempo otomatis'],
        stats: [
          { label: 'Status', value: 'Menunggu Pembayaran' },
          { label: 'Pembayaran Terakhir', value: 'Rp 1.000.000 (Batch 1)' },
        ],
        actionLabel: 'Lihat Detail Tagihan',
      },
    ],
  }),
  settings: new Section({
    id: 'settings',
    eyebrow: 'System Setting',
    title: 'Pengaturan Portal',
    subtitle: 'Atur preferensi keamanan dan integrasi akun.',
    cards: [
      {
        id: 'settings-card',
        title: 'Preferensi Sistem',
        description:
          'Kelola perangkat login, reset sandi, dan token API pihak ketiga.',
        features: [
          'Autentikasi multi-perangkat',
          'Log aktivitas terakhir',
          'Token integrasi pihak ketiga',
        ],
        actionLabel: 'Pengaturan Portal',
      },
    ],
  }),
};
