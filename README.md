# XYZ - Simulasi Load Balancer Weighted Round Robin

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Express-5.1-000000?style=flat-square&logo=express" alt="Express">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js" alt="Node.js">
</p>

Proyek simulasi **Sistem Informasi Akademik** (XYZ) dengan fitur utama demonstrasi algoritma **Load Balancer Weighted Round Robin (WRR)**. Aplikasi ini memungkinkan pengguna untuk memvisualisasikan distribusi traffic ke multiple backend server dan membandingkan performa berbagai algoritma load balancing.

## 📋 Daftar Isi

- [Statistik XYZ](#-statistik-XYZ)
- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Infrastruktur Server](#-infrastruktur-server)
- [Peak Time](#-peak-time)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Konfigurasi Server](#-konfigurasi-server)
- [API Endpoints](#-api-endpoints)
- [Algoritma Load Balancing](#-algoritma-load-balancing)
- [A/B Testing](#-ab-testing)

---

## 📊 Statistik XYZ

### Ringkasan Pengguna

| Kategori                  | Jumlah | Keterangan                      |
| ------------------------- | ------ | ------------------------------- |
| **Total Mahasiswa**       | 32.847 | Seluruh mahasiswa terdaftar     |
| **Mahasiswa Aktif**       | 28.456 | Status aktif semester berjalan  |
| **Mahasiswa Cuti**        | 892    | Dalam masa cuti akademik        |
| **Total Dosen**           | 1.247  | Dosen tetap & tidak tetap       |
| **Dosen Tetap**           | 892    | PNS & dosen tetap yayasan       |
| **Staff Akademik**        | 634    | Staff administrasi & akademik   |
| **Total Pengguna Sistem** | 34.728 | Mahasiswa aktif + dosen + staff |

### Distribusi Mahasiswa per Fakultas

| Fakultas                              | Kode  | Jumlah Mahasiswa | Jumlah Dosen |
| ------------------------------------- | ----- | ---------------- | ------------ |
| Fakultas Keguruan dan Ilmu Pendidikan | FKIP  | 7.123            | 312          |
| Fakultas Ekonomi dan Bisnis           | FEB   | 6.234            | 178          |
| Fakultas Teknik                       | FT    | 5.842            | 186          |
| Fakultas Hukum                        | FH    | 3.421            | 89           |
| Fakultas Ilmu Sosial dan Ilmu Politik | FISIP | 3.256            | 123          |
| Fakultas Pertanian                    | FP    | 2.845            | 145          |
| Fakultas Kedokteran                   | FK    | 2.126            | 156          |
| Pascasarjana                          | PPs   | 2.000            | 58           |

### Distribusi Jenjang Pendidikan

| Jenjang       | Jumlah | Persentase |
| ------------- | ------ | ---------- |
| S1 (Sarjana)  | 28.234 | 85.96%     |
| S2 (Magister) | 3.156  | 9.61%      |
| D3 (Diploma)  | 1.000  | 3.04%      |
| S3 (Doktor)   | 457    | 1.39%      |

### Kualifikasi Dosen

| Jabatan Fungsional | Jumlah | Persentase |
| ------------------ | ------ | ---------- |
| Profesor           | 47     | 3.77%      |
| Lektor Kepala      | 234    | 18.76%     |
| Lektor             | 389    | 31.20%     |
| Asisten Ahli       | 577    | 46.27%     |

---

## 🔧 Fitur XYZ

### Total: 47 Modul/Fitur

#### Fitur Mahasiswa (32 Fitur)

| No  | Fitur                  | Tingkat Akses | Avg. Akses/Hari |
| --- | ---------------------- | ------------- | --------------- |
| 1   | Dashboard Akademik     | Tinggi        | 15.420          |
| 2   | Notifikasi & Reminder  | Tinggi        | 14.200          |
| 3   | KRS Online             | Peak Season   | 12.300          |
| 4   | Presensi Online        | Tinggi        | 11.200          |
| 5   | Jadwal Perkuliahan     | Tinggi        | 9.800           |
| 6   | E-Learning Integration | Tinggi        | 8.900           |
| 7   | Registrasi Semester    | Peak Season   | 8.500           |
| 8   | Mobile App Sync        | Tinggi        | 7.800           |
| 9   | Hasil Studi / KHS      | Tinggi        | 7.600           |
| 10  | Tagihan UKT            | Peak Season   | 6.800           |
| 11  | Pengumuman Akademik    | Tinggi        | 6.500           |
| 12  | Perpustakaan Digital   | Tinggi        | 5.200           |
| 13  | Evaluasi Dosen         | Peak Season   | 4.200           |
| 14  | Kalender Akademik      | Sedang        | 3.400           |
| 15  | Transkrip Nilai        | Sedang        | 3.200           |
| 16  | Tugas Akhir / Skripsi  | Sedang        | 2.800           |
| 17  | Riwayat Pembayaran     | Sedang        | 2.400           |
| 18  | Forum Diskusi          | Sedang        | 2.300           |
| 19  | KTM Digital            | Sedang        | 2.100           |
| 20  | Beasiswa               | Peak Season   | 1.800           |
| 21  | Konsultasi PA Online   | Sedang        | 1.600           |
| 22  | Pengajuan Surat        | Sedang        | 1.400           |
| 23  | Biodata Mahasiswa      | Rendah        | 1.200           |
| 24  | Profil & Settings      | Rendah        | 980             |
| 25  | Surat Keterangan Aktif | Sedang        | 890             |
| 26  | Two-Factor Auth        | Rendah        | 560             |
| 27  | Pendaftaran Wisuda     | Peak Season   | 450             |
| 28  | Export Data Pribadi    | Rendah        | 320             |
| 29  | Histori Login          | Rendah        | 290             |
| 30  | Reset Password         | Rendah        | 180             |
| 31  | Pengajuan Cuti         | Rendah        | 120             |
| 32  | Laporan Bug / Feedback | Rendah        | 45              |

#### Fitur Dosen (15 Fitur)

| No  | Fitur                 | Tingkat Akses | Avg. Akses/Hari |
| --- | --------------------- | ------------- | --------------- |
| 1   | Persetujuan KRS       | Peak Season   | 4.500           |
| 2   | Presensi Mahasiswa    | Tinggi        | 3.800           |
| 3   | Dashboard Dosen       | Tinggi        | 3.200           |
| 4   | Input Nilai           | Peak Season   | 2.800           |
| 5   | E-Learning Management | Tinggi        | 2.400           |
| 6   | Jadwal Mengajar       | Tinggi        | 2.100           |
| 7   | Quiz & Assignment     | Sedang        | 1.600           |
| 8   | Bimbingan Tugas Akhir | Sedang        | 1.200           |
| 9   | Upload Materi         | Sedang        | 980             |
| 10  | Bimbingan Akademik    | Sedang        | 890             |
| 11  | Komunikasi Mahasiswa  | Sedang        | 780             |
| 12  | Laporan Akademik      | Rendah        | 420             |
| 13  | Jadwal Sidang         | Sedang        | 340             |
| 14  | Profil Dosen          | Rendah        | 210             |
| 15  | Beban Kerja Dosen     | Rendah        | 180             |

### Statistik Akses Harian

| Kondisi            | Request/Hari | Keterangan           |
| ------------------ | ------------ | -------------------- |
| Normal             | 98.500       | Hari kuliah biasa    |
| Peak Season        | 245.000      | KRS, Registrasi, UAS |
| Minimal            | 42.000       | Libur semester       |
| **Maksimal (KRS)** | **320.000**  | Hari pertama KRS     |

---

## 🖥️ Infrastruktur Server

### Ringkasan Infrastruktur

| Komponen           | Spesifikasi | Jumlah  |
| ------------------ | ----------- | ------- |
| **Total Server**   | -           | 12 unit |
| Server Produksi    | Aktif       | 8 unit  |
| Server DR          | Standby     | 2 unit  |
| Server Development | Aktif       | 2 unit  |
| **Total CPU Core** | -           | 96 core |
| **Total RAM**      | -           | 384 GB  |
| **Total Storage**  | SSD/NVMe    | 24 TB   |
| **Bandwidth**      | Dedicated   | 10 Gbps |

### Detail Server

| Server                      | Tipe      | Lokasi     | Spesifikasi                    | Fungsi                 |
| --------------------------- | --------- | ---------- | ------------------------------ | ---------------------- |
| **Load Balancer Primary**   | Nginx     | DC Serang  | 4 vCPU, 8 GB RAM               | Distribusi traffic WRR |
| **Load Balancer Secondary** | Nginx     | DC Serang  | 4 vCPU, 8 GB RAM               | Failover LB            |
| **App Server 1**            | VPS       | DC Serang  | 16 vCPU, 64 GB RAM, 500 GB SSD | Backend utama          |
| **App Server 2**            | VPS       | DC Serang  | 16 vCPU, 64 GB RAM, 500 GB SSD | Backend utama          |
| **App Server 3**            | VPS       | DC Cilegon | 8 vCPU, 32 GB RAM, 300 GB SSD  | Backend sekunder       |
| **Database Master**         | Dedicated | DC Serang  | 16 vCPU, 128 GB RAM, 2 TB NVMe | PostgreSQL Primary     |
| **Database Slave**          | Dedicated | DC Cilegon | 16 vCPU, 128 GB RAM, 2 TB NVMe | PostgreSQL Replica     |
| **Cache Server**            | VPS       | DC Serang  | 4 vCPU, 32 GB RAM              | Redis Cluster          |
| **DR App Server**           | VPS       | DC Jakarta | 8 vCPU, 32 GB RAM              | Disaster Recovery      |
| **DR Database**             | Dedicated | DC Jakarta | 8 vCPU, 64 GB RAM              | DR Replication         |
| **Development**             | Cloud     | -          | 4 vCPU, 16 GB RAM              | Dev & Testing          |
| **Staging**                 | Cloud     | -          | 4 vCPU, 16 GB RAM              | Pre-production         |

### Konfigurasi Load Balancer

| Server       | Host         | Region     | Bobot  | Kapasitas       | Latency | Error Rate |
| ------------ | ------------ | ---------- | ------ | --------------- | ------- | ---------- |
| App Server 1 | 10.10.10.11  | DC Serang  | 5      | 1.200 req/s     | 45 ms   | 1.5%       |
| App Server 2 | 10.10.10.12  | DC Serang  | 5      | 1.200 req/s     | 48 ms   | 1.5%       |
| App Server 3 | 10.10.20.11  | DC Cilegon | 3      | 800 req/s       | 62 ms   | 2.5%       |
| DR Server    | 172.16.50.11 | DC Jakarta | 1      | 400 req/s       | 95 ms   | 5.0%       |
| **Total**    | -            | -          | **14** | **3.600 req/s** | -       | -          |

### Distribusi Bobot

| Server       | Bobot | Persentase |
| ------------ | ----- | ---------- |
| App Server 1 | 5     | 35.71%     |
| App Server 2 | 5     | 35.71%     |
| App Server 3 | 3     | 21.43%     |
| DR Server    | 1     | 7.14%      |

### Monitoring & SLA

| Metrik              | Target  | Aktual |
| ------------------- | ------- | ------ |
| Uptime SLA          | 99.5%   | 99.72% |
| Response Time (Avg) | < 100ms | 52ms   |
| Response Time (P95) | < 200ms | 120ms  |
| Error Rate          | < 1%    | 0.3%   |
| Cache Hit Ratio     | > 90%   | 94.2%  |

**Tools Monitoring:** Prometheus, Grafana, AlertManager, Loki

---

## ⏰ Peak Time

### Jam Sibuk Harian

| Waktu             | Load (%) | Keterangan                              |
| ----------------- | -------- | --------------------------------------- |
| 06:00 - 07:00     | 15%      | Mahasiswa mulai cek jadwal              |
| 07:00 - 08:00     | 45%      | Login massal sebelum kuliah pagi        |
| **08:00 - 10:00** | **75%**  | **Peak pagi - presensi & akses materi** |
| 10:00 - 12:00     | 65%      | Akses sedang - perkuliahan berlangsung  |
| 12:00 - 13:00     | 40%      | Istirahat siang                         |
| 13:00 - 15:00     | 70%      | Peak siang - kuliah siang & presensi    |
| 15:00 - 17:00     | 55%      | Akses sedang                            |
| 17:00 - 19:00     | 35%      | Transisi sore-malam                     |
| **19:00 - 21:00** | **80%**  | **Peak malam - akses dari rumah**       |
| 21:00 - 23:00     | 60%      | Akses tugas & e-learning                |
| 23:00 - 06:00     | 10%      | Off-peak - maintenance window           |

### Peak Season Tahunan

| Periode             | Bulan     | Durasi  | Load Multiplier | Est. Request |
| ------------------- | --------- | ------- | --------------- | ------------ |
| **Pengisian KRS**   | Feb & Ags | 7 hari  | **4.0x**        | **980.000**  |
| Registrasi Semester | Jan & Jul | 14 hari | 3.5x            | 850.000      |
| UAS & Input Nilai   | Mei & Des | 21 hari | 2.5x            | 650.000      |
| UTS                 | Mar & Okt | 14 hari | 1.8x            | 420.000      |
| Wisuda              | Apr & Nov | 30 hari | 1.5x            | 180.000      |
| SNBP/SNBT           | Mar - Mei | 60 hari | 1.3x            | 120.000      |

### Statistik Request

| Metrik        | Normal | Peak    |
| ------------- | ------ | ------- |
| Request/Hari  | 98.500 | 320.000 |
| Request/Jam   | 4.104  | 28.000  |
| Request/Menit | 68     | 467     |
| Request/Detik | 1.14   | 7.8     |

---

## ✨ Fitur

### Dashboard XYZ

- 📊 Dashboard informasi akademik mahasiswa
- 📅 Modul praperkuliahan (Registrasi, KRS)
- 📚 Modul perkuliahan (Jadwal, Hasil Studi)
- 🎓 Modul tugas akhir dan pascaperkuliahan
- 👤 Data dasar biodata mahasiswa

### Simulasi Load Balancer

- ⚖️ **Weighted Round Robin (WRR)** - distribusi berdasarkan bobot server
- 🔄 **Simple Round Robin** - distribusi merata tanpa bobot
- 🎲 **Random Selection** - pemilihan server secara acak
- 📈 Visualisasi real-time distribusi request
- ➕ Tambah/hapus/edit server secara dinamis
- 📉 Monitoring latency dan error rate

### A/B Testing

- 🔬 Perbandingan performa antar algoritma
- 📊 Grafik Chart.js untuk visualisasi hasil
- 📥 Ekspor grafik ke format PNG
- 📋 Metrik lengkap (Avg, P95, P99 latency, error rate)

## 🛠 Tech Stack

| Layer      | Teknologi                    |
| ---------- | ---------------------------- |
| Frontend   | React 18, React Router DOM 6 |
| Build Tool | Vite 5                       |
| Backend    | Express 5, Node.js           |
| Charting   | Chart.js, react-chartjs-2    |
| Styling    | CSS Custom Properties        |

## 📦 Prasyarat

Pastikan sistem Anda sudah terinstall:

- **Node.js** versi 18 atau lebih baru
- **npm** versi 9 atau lebih baru (biasanya sudah terinstall bersama Node.js)

Cek versi dengan perintah:

```bash
node --version
npm --version
```

## 🚀 Instalasi

1. **Clone repository**

```bash
git clone https://github.com/username/XYZ-kw.git
cd XYZ-kw
```

2. **Install dependencies**

```bash
npm install
```

## ▶️ Menjalankan Aplikasi

Aplikasi ini terdiri dari **2 komponen** yang harus dijalankan:

### 1. Jalankan Backend Server (Load Balancer API)

```bash
npm run server
```

Backend akan berjalan di `http://localhost:4000`

### 2. Jalankan Frontend (Development Server)

Buka terminal baru, lalu jalankan:

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### Menjalankan Keduanya Sekaligus (Opsional)

Untuk kemudahan, Anda bisa membuka 2 terminal atau menggunakan tools seperti `concurrently`:

**Terminal 1:**

```bash
npm run server
```

**Terminal 2:**

```bash
npm run dev
```

### Build untuk Production

```bash
npm run build
npm run preview
```

## 📁 Struktur Proyek

```
XYZ-kw/
├── dist/                    # Output build production
├── server/
│   ├── index.js             # Express server & API endpoints
│   └── loadBalancer.js      # Implementasi algoritma load balancing + stats
├── src/
│   ├── components/
│   │   ├── ComparisonChart.jsx  # Chart untuk A/B testing
│   │   └── Layout.jsx           # Layout utama aplikasi
│   ├── data/
│   │   ├── siteData.js      # Data statis mahasiswa & menu
│   │   └── XYZStats.js  # Statistik XYZ (pengguna, fitur, peak time)
│   ├── models/
│   │   ├── MetricCard.js    # Model kartu metrik
│   │   ├── ModuleCard.js    # Model kartu modul
│   │   ├── Section.js       # Model section halaman
│   │   └── Student.js       # Model data mahasiswa
│   ├── pages/
│   │   ├── DashboardPage.jsx    # Halaman dashboard utama
│   │   ├── LoadBalancerPage.jsx # Halaman simulasi load balancer
│   │   ├── ModulePage.jsx       # Halaman modul generik
│   │   └── NotFoundPage.jsx     # Halaman 404
│   ├── App.jsx              # Root component & routing
│   ├── index.css            # Global styles
│   └── main.jsx             # Entry point React
├── index.html               # HTML template
├── package.json             # Dependencies & scripts
└── vite.config.js           # Konfigurasi Vite
```

## ⚙️ Konfigurasi Server

Server pool didefinisikan di `server/loadBalancer.js`:

```javascript
export const upstreamPool = [
  {
    id: "app-01",
    label: "App Server 1",
    host: "10.10.10.11",
    region: "DC Serang",
    weight: 5, // Bobot distribusi
    status: "up", // up | down
    latencyMs: 45, // Latency dasar (ms)
    role: "Backend Utama - API Core",
    capacity: 1200, // Kapasitas request/sec
    errorRate: 0.015, // Error rate (1.5%)
    specs: "16 vCPU, 64 GB RAM",
  },
  // ... server lainnya
];
```

### Tabel Konfigurasi Default

| Server       | Host         | Region     | Bobot | Kapasitas   | Latency | Error Rate | Spesifikasi    |
| ------------ | ------------ | ---------- | ----- | ----------- | ------- | ---------- | -------------- |
| App Server 1 | 10.10.10.11  | DC Serang  | 5     | 1.200 req/s | 45 ms   | 1.5%       | 16 vCPU, 64 GB |
| App Server 2 | 10.10.10.12  | DC Serang  | 5     | 1.200 req/s | 48 ms   | 1.5%       | 16 vCPU, 64 GB |
| App Server 3 | 10.10.20.11  | DC Cilegon | 3     | 800 req/s   | 62 ms   | 2.5%       | 8 vCPU, 32 GB  |
| DR Server    | 172.16.50.11 | DC Jakarta | 1     | 400 req/s   | 95 ms   | 5.0%       | 8 vCPU, 32 GB  |

## 🔌 API Endpoints

### Health Check

```
GET /api/health
```

### Server Management

```
GET    /api/servers          # Dapatkan status semua server
POST   /api/servers          # Tambah server baru
PATCH  /api/servers/:id      # Update bobot/status server
DELETE /api/servers/:id      # Hapus server
```

### Traffic Simulation

```
POST /api/traffic            # Kirim request simulasi
POST /api/reset              # Reset statistik simulasi
```

### A/B Testing

```
GET  /api/ab-test/algorithms # Daftar algoritma tersedia
GET  /api/ab-test/status     # Status A/B test
POST /api/ab-test/configure  # Konfigurasi parameter test
POST /api/ab-test/start      # Mulai A/B test
POST /api/ab-test/stop       # Hentikan A/B test
POST /api/ab-test/reset      # Reset A/B test
POST /api/ab-test/quick-sim  # Simulasi cepat perbandingan
```

### Contoh Request

**Kirim 100 request simulasi:**

```bash
curl -X POST http://localhost:4000/api/traffic \
  -H "Content-Type: application/json" \
  -d '{"count": 100}'
```

**Update bobot server:**

```bash
curl -X PATCH http://localhost:4000/api/servers/registrasi-core \
  -H "Content-Type: application/json" \
  -d '{"weight": 7}'
```

## 🔄 Algoritma Load Balancing

### 1. Weighted Round Robin (WRR)

Distribusi request berdasarkan bobot server. Server dengan bobot lebih tinggi menerima lebih banyak request.

**Rumus Distribusi:**

```
Persentase = (Bobot Server / Total Bobot) × 100%
```

**Contoh:**
| Server | Bobot | Persentase |
|--------|-------|------------|
| Server A | 5 | 55.56% |
| Server B | 3 | 33.33% |
| Server C | 1 | 11.11% |

### 2. Simple Round Robin

Distribusi merata ke semua server aktif tanpa mempertimbangkan kapasitas.

### 3. Random Selection

Pemilihan server secara acak untuk setiap request.

## 🔬 A/B Testing

Fitur A/B testing memungkinkan perbandingan real-time antara algoritma:

1. Pilih algoritma pembanding (Simple RR atau Random)
2. Tentukan jumlah request simulasi
3. Aktifkan/nonaktifkan simulasi latency & error realistis
4. Jalankan simulasi dan lihat perbandingan:
   - Rata-rata latency
   - P95 & P99 latency
   - Error rate
   - Distribusi per server

### Metrik yang Dibandingkan

| Metrik       | Deskripsi                        |
| ------------ | -------------------------------- |
| Avg Latency  | Rata-rata waktu respons          |
| P95 Latency  | 95% request di bawah nilai ini   |
| P99 Latency  | 99% request di bawah nilai ini   |
| Error Rate   | Persentase request gagal         |
| Distribution | Pembagian request ke tiap server |

## 📊 Environment Variables

Buat file `.env` di root project (opsional):

```env
# Port backend server
PORT=4000

# Base URL untuk API (frontend)
VITE_LB_BASE_URL=http://localhost:4000
```

## 🤝 Contributing

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License.

---

<p align="center">
  Dibuat dengan ❤️ untuk pembelajaran algoritma Load Balancing
</p>

