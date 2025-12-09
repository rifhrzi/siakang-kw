# SIAKANG - Simulasi Load Balancer Weighted Round Robin

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Express-5.1-000000?style=flat-square&logo=express" alt="Express">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js" alt="Node.js">
</p>

Proyek simulasi **Sistem Informasi Akademik** (SIAKANG) dengan fitur utama demonstrasi algoritma **Load Balancer Weighted Round Robin (WRR)**. Aplikasi ini memungkinkan pengguna untuk memvisualisasikan distribusi traffic ke multiple backend server dan membandingkan performa berbagai algoritma load balancing.

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Struktur Proyek](#-struktur-proyek)
- [Konfigurasi Server](#-konfigurasi-server)
- [API Endpoints](#-api-endpoints)
- [Algoritma Load Balancing](#-algoritma-load-balancing)
- [A/B Testing](#-ab-testing)

## ✨ Fitur

### Dashboard SIAKANG
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

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, React Router DOM 6 |
| Build Tool | Vite 5 |
| Backend | Express 5, Node.js |
| Charting | Chart.js, react-chartjs-2 |
| Styling | CSS Custom Properties |

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
git clone https://github.com/username/siakang-kw.git
cd siakang-kw
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
siakang-kw/
├── dist/                    # Output build production
├── server/
│   ├── index.js             # Express server & API endpoints
│   └── loadBalancer.js      # Implementasi algoritma load balancing
├── src/
│   ├── components/
│   │   ├── ComparisonChart.jsx  # Chart untuk A/B testing
│   │   └── Layout.jsx           # Layout utama aplikasi
│   ├── data/
│   │   └── siteData.js      # Data statis mahasiswa & menu
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
    id: 'registrasi-core',
    label: 'Registrasi Core',
    host: '10.10.10.11',
    region: 'DC Serang',
    weight: 5,              // Bobot distribusi
    status: 'up',           // up | down
    latencyMs: 46,          // Latency dasar (ms)
    role: 'Pembayaran & registrasi',
    capacity: 1000,         // Kapasitas request/sec
    errorRate: 0.02,        // Error rate (2%)
  },
  // ... server lainnya
];
```

### Tabel Konfigurasi Default

| Server | Host | Region | Bobot | Kapasitas | Latency | Error Rate |
|--------|------|--------|-------|-----------|---------|------------|
| Registrasi Core | 10.10.10.11 | DC Serang | 5 | 1000 req/s | 46 ms | 2% |
| Akademik Reserve | 10.10.10.12 | DC Cilegon | 3 | 600 req/s | 62 ms | 3% |
| DR Site | 172.16.20.31 | Pusat DR | 1 | 200 req/s | 105 ms | 8% |
| Lab Performance | 10.10.55.10 | Lab Infra | 2 | 400 req/s | 54 ms | 4% |

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

| Metrik | Deskripsi |
|--------|-----------|
| Avg Latency | Rata-rata waktu respons |
| P95 Latency | 95% request di bawah nilai ini |
| P99 Latency | 99% request di bawah nilai ini |
| Error Rate | Persentase request gagal |
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

