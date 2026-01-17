/**
 * XYZ (Sistem Informasi Akademik) - Statistik & Data Infrastruktur
 * Universitas Sultan Ageng Tirtayasa (Untirta)
 * 
 * Data ini merepresentasikan skala sistem akademik universitas dengan
 * ~30.000 mahasiswa aktif dan ~1.200 dosen.
 */

// ==================== STATISTIK PENGGUNA ====================

export const userStats = {
  // Total Mahasiswa
  mahasiswa: {
    total: 32847,
    aktif: 28456,
    cuti: 892,
    nonAktif: 3499,
    breakdown: {
      s1: 28234,
      s2: 3156,
      s3: 457,
      d3: 1000,
    },
    perFakultas: [
      { nama: 'Fakultas Teknik', jumlah: 5842, kode: 'FT' },
      { nama: 'Fakultas Ekonomi dan Bisnis', jumlah: 6234, kode: 'FEB' },
      { nama: 'Fakultas Hukum', jumlah: 3421, kode: 'FH' },
      { nama: 'Fakultas Keguruan dan Ilmu Pendidikan', jumlah: 7123, kode: 'FKIP' },
      { nama: 'Fakultas Pertanian', jumlah: 2845, kode: 'FP' },
      { nama: 'Fakultas Ilmu Sosial dan Ilmu Politik', jumlah: 3256, kode: 'FISIP' },
      { nama: 'Fakultas Kedokteran', jumlah: 2126, kode: 'FK' },
      { nama: 'Pascasarjana', jumlah: 2000, kode: 'PPs' },
    ],
  },

  // Total Dosen
  dosen: {
    total: 1247,
    tetap: 892,
    tidakTetap: 355,
    breakdown: {
      profesor: 47,
      lektorKepala: 234,
      lektor: 389,
      asisten: 577,
    },
    perFakultas: [
      { nama: 'Fakultas Teknik', jumlah: 186 },
      { nama: 'Fakultas Ekonomi dan Bisnis', jumlah: 178 },
      { nama: 'Fakultas Hukum', jumlah: 89 },
      { nama: 'Fakultas Keguruan dan Ilmu Pendidikan', jumlah: 312 },
      { nama: 'Fakultas Pertanian', jumlah: 145 },
      { nama: 'Fakultas Ilmu Sosial dan Ilmu Politik', jumlah: 123 },
      { nama: 'Fakultas Kedokteran', jumlah: 156 },
      { nama: 'Pascasarjana', jumlah: 58 },
    ],
  },

  // Staff Akademik & Administrasi
  staff: {
    total: 634,
    akademik: 245,
    administrasi: 389,
  },

  // Total Pengguna Aktif Sistem
  totalUsers: 34728, // mahasiswa aktif + dosen + staff
};

// ==================== FITUR XYZ ====================

export const features = {
  totalModul: 47,
  
  // Fitur untuk Mahasiswa (32 fitur)
  mahasiswa: [
    { nama: 'Dashboard Akademik', akses: 'Tinggi', avgAksesHarian: 15420 },
    { nama: 'Registrasi Semester', akses: 'Peak Season', avgAksesHarian: 8500 },
    { nama: 'KRS Online', akses: 'Peak Season', avgAksesHarian: 12300 },
    { nama: 'Jadwal Perkuliahan', akses: 'Tinggi', avgAksesHarian: 9800 },
    { nama: 'Hasil Studi / KHS', akses: 'Tinggi', avgAksesHarian: 7600 },
    { nama: 'Transkrip Nilai', akses: 'Sedang', avgAksesHarian: 3200 },
    { nama: 'Biodata Mahasiswa', akses: 'Rendah', avgAksesHarian: 1200 },
    { nama: 'Tagihan UKT', akses: 'Peak Season', avgAksesHarian: 6800 },
    { nama: 'Riwayat Pembayaran', akses: 'Sedang', avgAksesHarian: 2400 },
    { nama: 'Kartu Tanda Mahasiswa Digital', akses: 'Sedang', avgAksesHarian: 2100 },
    { nama: 'Presensi Online', akses: 'Tinggi', avgAksesHarian: 11200 },
    { nama: 'E-Learning Integration', akses: 'Tinggi', avgAksesHarian: 8900 },
    { nama: 'Pengajuan Cuti', akses: 'Rendah', avgAksesHarian: 120 },
    { nama: 'Surat Keterangan Aktif', akses: 'Sedang', avgAksesHarian: 890 },
    { nama: 'Tugas Akhir / Skripsi', akses: 'Sedang', avgAksesHarian: 2800 },
    { nama: 'Pendaftaran Wisuda', akses: 'Peak Season', avgAksesHarian: 450 },
    { nama: 'Evaluasi Dosen', akses: 'Peak Season', avgAksesHarian: 4200 },
    { nama: 'Beasiswa', akses: 'Peak Season', avgAksesHarian: 1800 },
    { nama: 'Pengumuman Akademik', akses: 'Tinggi', avgAksesHarian: 6500 },
    { nama: 'Kalender Akademik', akses: 'Sedang', avgAksesHarian: 3400 },
    { nama: 'Konsultasi PA Online', akses: 'Sedang', avgAksesHarian: 1600 },
    { nama: 'Perpustakaan Digital', akses: 'Tinggi', avgAksesHarian: 5200 },
    { nama: 'Forum Diskusi', akses: 'Sedang', avgAksesHarian: 2300 },
    { nama: 'Notifikasi & Reminder', akses: 'Tinggi', avgAksesHarian: 14200 },
    { nama: 'Profil & Settings', akses: 'Rendah', avgAksesHarian: 980 },
    { nama: 'Laporan Bug / Feedback', akses: 'Rendah', avgAksesHarian: 45 },
    { nama: 'Mobile App Sync', akses: 'Tinggi', avgAksesHarian: 7800 },
    { nama: 'Export Data Pribadi', akses: 'Rendah', avgAksesHarian: 320 },
    { nama: 'Reset Password', akses: 'Rendah', avgAksesHarian: 180 },
    { nama: 'Two-Factor Auth', akses: 'Rendah', avgAksesHarian: 560 },
    { nama: 'Histori Login', akses: 'Rendah', avgAksesHarian: 290 },
    { nama: 'Pengajuan Surat', akses: 'Sedang', avgAksesHarian: 1400 },
  ],

  // Fitur untuk Dosen (15 fitur)
  dosen: [
    { nama: 'Dashboard Dosen', akses: 'Tinggi', avgAksesHarian: 3200 },
    { nama: 'Input Nilai', akses: 'Peak Season', avgAksesHarian: 2800 },
    { nama: 'Persetujuan KRS', akses: 'Peak Season', avgAksesHarian: 4500 },
    { nama: 'Jadwal Mengajar', akses: 'Tinggi', avgAksesHarian: 2100 },
    { nama: 'Presensi Mahasiswa', akses: 'Tinggi', avgAksesHarian: 3800 },
    { nama: 'Bimbingan Akademik', akses: 'Sedang', avgAksesHarian: 890 },
    { nama: 'Bimbingan Tugas Akhir', akses: 'Sedang', avgAksesHarian: 1200 },
    { nama: 'Jadwal Sidang', akses: 'Sedang', avgAksesHarian: 340 },
    { nama: 'Beban Kerja Dosen', akses: 'Rendah', avgAksesHarian: 180 },
    { nama: 'Laporan Akademik', akses: 'Rendah', avgAksesHarian: 420 },
    { nama: 'E-Learning Management', akses: 'Tinggi', avgAksesHarian: 2400 },
    { nama: 'Upload Materi', akses: 'Sedang', avgAksesHarian: 980 },
    { nama: 'Quiz & Assignment', akses: 'Sedang', avgAksesHarian: 1600 },
    { nama: 'Komunikasi Mahasiswa', akses: 'Sedang', avgAksesHarian: 780 },
    { nama: 'Profil Dosen', akses: 'Rendah', avgAksesHarian: 210 },
  ],

  // Total akses harian rata-rata
  totalAksesHarian: {
    normal: 98500,
    peakSeason: 245000,
    minimal: 42000,
  },
};

// ==================== PEAK TIME / JAM SIBUK ====================

export const peakTimes = {
  // Peak time harian
  harian: [
    { jam: '06:00 - 07:00', load: 15, keterangan: 'Mahasiswa mulai cek jadwal' },
    { jam: '07:00 - 08:00', load: 45, keterangan: 'Login massal sebelum kuliah pagi' },
    { jam: '08:00 - 10:00', load: 75, keterangan: 'Peak pagi - presensi & akses materi' },
    { jam: '10:00 - 12:00', load: 65, keterangan: 'Akses sedang - perkuliahan berlangsung' },
    { jam: '12:00 - 13:00', load: 40, keterangan: 'Istirahat siang' },
    { jam: '13:00 - 15:00', load: 70, keterangan: 'Peak siang - kuliah siang & presensi' },
    { jam: '15:00 - 17:00', load: 55, keterangan: 'Akses sedang' },
    { jam: '17:00 - 19:00', load: 35, keterangan: 'Transisi sore-malam' },
    { jam: '19:00 - 21:00', load: 80, keterangan: 'Peak malam - mahasiswa akses dari rumah' },
    { jam: '21:00 - 23:00', load: 60, keterangan: 'Akses tugas & e-learning' },
    { jam: '23:00 - 06:00', load: 10, keterangan: 'Off-peak - maintenance window' },
  ],

  // Peak season tahunan
  seasonal: [
    {
      periode: 'Registrasi Semester',
      bulan: 'Januari & Juli',
      durasiHari: 14,
      loadMultiplier: 3.5,
      estimasiRequest: 850000,
      keterangan: 'Pembayaran UKT & registrasi ulang',
    },
    {
      periode: 'Pengisian KRS',
      bulan: 'Februari & Agustus',
      durasiHari: 7,
      loadMultiplier: 4.0,
      estimasiRequest: 980000,
      keterangan: 'Traffic tertinggi - rebutan kelas populer',
    },
    {
      periode: 'UTS',
      bulan: 'Maret & Oktober',
      durasiHari: 14,
      loadMultiplier: 1.8,
      estimasiRequest: 420000,
      keterangan: 'Input nilai UTS oleh dosen',
    },
    {
      periode: 'UAS',
      bulan: 'Mei & Desember',
      durasiHari: 21,
      loadMultiplier: 2.5,
      estimasiRequest: 650000,
      keterangan: 'Input nilai akhir & lihat KHS',
    },
    {
      periode: 'Wisuda',
      bulan: 'April & November',
      durasiHari: 30,
      loadMultiplier: 1.5,
      estimasiRequest: 180000,
      keterangan: 'Pendaftaran & verifikasi wisuda',
    },
    {
      periode: 'SNBP/SNBT',
      bulan: 'Maret - Mei',
      durasiHari: 60,
      loadMultiplier: 1.3,
      estimasiRequest: 120000,
      keterangan: 'Calon mahasiswa cek info',
    },
  ],

  // Statistik request
  requestStats: {
    avgPerHari: 98500,
    peakPerHari: 320000,
    avgPerJam: 4104,
    peakPerJam: 28000,
    avgPerMenit: 68,
    peakPerMenit: 467,
    avgPerDetik: 1.14,
    peakPerDetik: 7.8,
  },
};

// ==================== INFRASTRUKTUR SERVER ====================

export const infrastructure = {
  // Ringkasan
  summary: {
    totalServer: 12,
    serverProduksi: 8,
    serverDR: 2,
    serverDev: 2,
    totalCPUCore: 96,
    totalRAM: '384 GB',
    totalStorage: '24 TB',
    bandwidth: '10 Gbps',
  },

  // Detail Server
  servers: [
    // Production Servers
    {
      id: 'web-lb-01',
      nama: 'Load Balancer Primary',
      tipe: 'Nginx',
      lokasi: 'DC Serang',
      spesifikasi: { cpu: '4 vCPU', ram: '8 GB', storage: '100 GB SSD' },
      fungsi: 'Distribusi traffic dengan WRR',
      status: 'active',
    },
    {
      id: 'web-lb-02',
      nama: 'Load Balancer Secondary',
      tipe: 'Nginx',
      lokasi: 'DC Serang',
      spesifikasi: { cpu: '4 vCPU', ram: '8 GB', storage: '100 GB SSD' },
      fungsi: 'Failover load balancer',
      status: 'standby',
    },
    {
      id: 'app-01',
      nama: 'Application Server 1',
      tipe: 'VPS',
      lokasi: 'DC Serang',
      spesifikasi: { cpu: '16 vCPU', ram: '64 GB', storage: '500 GB SSD' },
      fungsi: 'Backend utama - API & Business Logic',
      status: 'active',
      weight: 5,
    },
    {
      id: 'app-02',
      nama: 'Application Server 2',
      tipe: 'VPS',
      lokasi: 'DC Serang',
      spesifikasi: { cpu: '16 vCPU', ram: '64 GB', storage: '500 GB SSD' },
      fungsi: 'Backend utama - API & Business Logic',
      status: 'active',
      weight: 5,
    },
    {
      id: 'app-03',
      nama: 'Application Server 3',
      tipe: 'VPS',
      lokasi: 'DC Cilegon',
      spesifikasi: { cpu: '8 vCPU', ram: '32 GB', storage: '300 GB SSD' },
      fungsi: 'Backend sekunder - Read replica',
      status: 'active',
      weight: 3,
    },
    {
      id: 'db-master',
      nama: 'Database Master',
      tipe: 'Dedicated',
      lokasi: 'DC Serang',
      spesifikasi: { cpu: '16 vCPU', ram: '128 GB', storage: '2 TB NVMe' },
      fungsi: 'PostgreSQL Primary - Write operations',
      status: 'active',
    },
    {
      id: 'db-slave',
      nama: 'Database Slave',
      tipe: 'Dedicated',
      lokasi: 'DC Cilegon',
      spesifikasi: { cpu: '16 vCPU', ram: '128 GB', storage: '2 TB NVMe' },
      fungsi: 'PostgreSQL Replica - Read operations',
      status: 'active',
    },
    {
      id: 'cache-01',
      nama: 'Cache Server',
      tipe: 'VPS',
      lokasi: 'DC Serang',
      spesifikasi: { cpu: '4 vCPU', ram: '32 GB', storage: '100 GB SSD' },
      fungsi: 'Redis cluster untuk session & caching',
      status: 'active',
    },
    // DR Servers
    {
      id: 'dr-app',
      nama: 'DR Application Server',
      tipe: 'VPS',
      lokasi: 'DC Jakarta (Colocation)',
      spesifikasi: { cpu: '8 vCPU', ram: '32 GB', storage: '500 GB SSD' },
      fungsi: 'Disaster Recovery - Warm standby',
      status: 'standby',
      weight: 1,
    },
    {
      id: 'dr-db',
      nama: 'DR Database Server',
      tipe: 'Dedicated',
      lokasi: 'DC Jakarta (Colocation)',
      spesifikasi: { cpu: '8 vCPU', ram: '64 GB', storage: '2 TB SSD' },
      fungsi: 'Disaster Recovery - Async replication',
      status: 'standby',
    },
    // Development
    {
      id: 'dev-01',
      nama: 'Development Server',
      tipe: 'VPS',
      lokasi: 'Cloud',
      spesifikasi: { cpu: '4 vCPU', ram: '16 GB', storage: '200 GB SSD' },
      fungsi: 'Development & Testing',
      status: 'active',
    },
    {
      id: 'staging-01',
      nama: 'Staging Server',
      tipe: 'VPS',
      lokasi: 'Cloud',
      spesifikasi: { cpu: '4 vCPU', ram: '16 GB', storage: '200 GB SSD' },
      fungsi: 'Pre-production testing',
      status: 'active',
    },
  ],

  // Monitoring
  monitoring: {
    tools: ['Prometheus', 'Grafana', 'AlertManager', 'Loki'],
    metrics: [
      'CPU Usage',
      'Memory Usage',
      'Disk I/O',
      'Network Traffic',
      'Request Latency',
      'Error Rate',
      'Active Connections',
      'Database Queries/sec',
    ],
    alertChannels: ['Email', 'Telegram', 'SMS'],
    uptimeSLA: '99.5%',
    actualUptime: '99.72%',
  },
};

// ==================== KAPASITAS & PERFORMA ====================

export const capacity = {
  // Kapasitas per server aplikasi
  perServer: {
    maxConcurrentUsers: 5000,
    maxRequestPerSecond: 1200,
    avgResponseTime: '45ms',
    p95ResponseTime: '120ms',
    p99ResponseTime: '250ms',
  },

  // Total kapasitas sistem (dengan LB)
  total: {
    maxConcurrentUsers: 18000,
    maxRequestPerSecond: 4200,
    avgResponseTime: '52ms',
    peakResponseTime: '180ms',
  },

  // Database
  database: {
    maxConnections: 500,
    avgQueryTime: '8ms',
    queriesPerSecond: 12000,
    replicationLag: '<1s',
  },

  // Cache hit ratio
  cache: {
    hitRatio: '94.2%',
    avgLatency: '0.8ms',
    memoryUsage: '78%',
  },
};

// ==================== RINGKASAN UNTUK DISPLAY ====================

export const XYZSummary = {
  // Untuk ditampilkan di hero section
  quickStats: [
    { label: 'Total Mahasiswa', value: '32.847', icon: '👨‍🎓' },
    { label: 'Mahasiswa Aktif', value: '28.456', icon: '✅' },
    { label: 'Total Dosen', value: '1.247', icon: '👨‍🏫' },
    { label: 'Total Fitur', value: '47', icon: '⚙️' },
    { label: 'Server Aktif', value: '10/12', icon: '🖥️' },
    { label: 'Uptime', value: '99.72%', icon: '📈' },
  ],

  // Peak time summary
  peakTimeSummary: {
    jamTersibuk: '19:00 - 21:00',
    hariTersibuk: 'Senin & Selasa',
    bulanTersibuk: 'Februari & Agustus (KRS)',
    maxConcurrent: '18.000 users',
    avgDailyRequest: '98.500',
    peakDailyRequest: '320.000',
  },

  // Infrastruktur summary
  infraSummary: {
    totalServer: 12,
    loadBalancer: 'Nginx + WRR',
    database: 'PostgreSQL (Master-Slave)',
    cache: 'Redis Cluster',
    monitoring: 'Prometheus + Grafana',
    lokasi: ['DC Serang', 'DC Cilegon', 'DC Jakarta (DR)'],
  },
};




