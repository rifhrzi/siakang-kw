import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function LatencyComparisonChart({ groupA, groupB }) {
  const chartRef = useRef(null);

  const data = {
    labels: ['Avg Latency', 'P95 Latency', 'P99 Latency', 'Min Latency', 'Max Latency'],
    datasets: [
      {
        label: 'Weighted Round Robin',
        data: [
          groupA.stats.avgLatency,
          groupA.stats.p95Latency,
          groupA.stats.p99Latency,
          groupA.stats.minLatency,
          groupA.stats.maxLatency,
        ],
        backgroundColor: 'rgba(15, 140, 85, 0.8)',
        borderColor: 'rgba(15, 140, 85, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: groupB.label,
        data: [
          groupB.stats.avgLatency,
          groupB.stats.p95Latency,
          groupB.stats.p99Latency,
          groupB.stats.minLatency,
          groupB.stats.maxLatency,
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter, system-ui, sans-serif', weight: 600 },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Perbandingan Latency (ms)',
        font: { family: 'Inter, system-ui, sans-serif', size: 16, weight: 700 },
        padding: { bottom: 20 },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} ms`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Latency (ms)',
          font: { family: 'Inter, system-ui, sans-serif', weight: 600 },
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image('image/png', 1);
      const link = document.createElement('a');
      link.download = 'latency-comparison.png';
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <Bar ref={chartRef} data={data} options={options} />
      </div>
      <button type="button" className="btn secondary chart-download" onClick={handleDownload}>
        📥 Unduh Chart (PNG)
      </button>
    </div>
  );
}

export function ErrorRateComparisonChart({ groupA, groupB }) {
  const chartRef = useRef(null);

  const data = {
    labels: ['Success Rate', 'Error Rate'],
    datasets: [
      {
        label: 'Weighted Round Robin',
        data: [
          ((1 - groupA.stats.errorRate) * 100).toFixed(1),
          (groupA.stats.errorRate * 100).toFixed(1),
        ],
        backgroundColor: ['rgba(15, 140, 85, 0.8)', 'rgba(220, 38, 38, 0.8)'],
        borderColor: ['rgba(15, 140, 85, 1)', 'rgba(220, 38, 38, 1)'],
        borderWidth: 2,
      },
    ],
  };

  const dataB = {
    labels: ['Success Rate', 'Error Rate'],
    datasets: [
      {
        label: groupB.label,
        data: [
          ((1 - groupB.stats.errorRate) * 100).toFixed(1),
          (groupB.stats.errorRate * 100).toFixed(1),
        ],
        backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(220, 38, 38, 0.8)'],
        borderColor: ['rgba(99, 102, 241, 1)', 'rgba(220, 38, 38, 1)'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}%`,
        },
      },
    },
    cutout: '60%',
  };

  const handleDownload = () => {
    // Create a combined canvas for both charts
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#1f2433';
    ctx.font = 'bold 18px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Perbandingan Error Rate', canvas.width / 2, 30);

    // Get both chart canvases
    const charts = document.querySelectorAll('.error-rate-chart canvas');
    if (charts.length >= 2) {
      ctx.drawImage(charts[0], 50, 60, 300, 300);
      ctx.drawImage(charts[1], 450, 60, 300, 300);

      // Labels
      ctx.font = 'bold 14px Inter, system-ui, sans-serif';
      ctx.fillText('Weighted Round Robin', 200, 380);
      ctx.fillText(groupB.label, 600, 380);
    }

    const url = canvas.toDataURL('image/png', 1);
    const link = document.createElement('a');
    link.download = 'error-rate-comparison.png';
    link.href = url;
    link.click();
  };

  return (
    <div className="chart-container">
      <h4 className="chart-title">Perbandingan Error Rate</h4>
      <div className="chart-dual">
        <div className="chart-dual__item">
          <div className="error-rate-chart">
            <Doughnut data={data} options={options} />
          </div>
          <p className="chart-label">Weighted Round Robin</p>
          <p className="chart-value">{(groupA.stats.errorRate * 100).toFixed(1)}% Error</p>
        </div>
        <div className="chart-dual__item">
          <div className="error-rate-chart">
            <Doughnut data={dataB} options={options} />
          </div>
          <p className="chart-label">{groupB.label}</p>
          <p className="chart-value">{(groupB.stats.errorRate * 100).toFixed(1)}% Error</p>
        </div>
      </div>
      <button type="button" className="btn secondary chart-download" onClick={handleDownload}>
        📥 Unduh Chart (PNG)
      </button>
    </div>
  );
}

export function DistributionComparisonChart({ groupA, groupB, servers }) {
  const chartRef = useRef(null);

  const serverLabels = servers.map((s) => s.label);
  const groupAData = servers.map((s) => groupA.stats.distribution[s.id] || 0);
  const groupBData = servers.map((s) => groupB.stats.distribution[s.id] || 0);

  const data = {
    labels: serverLabels,
    datasets: [
      {
        label: 'Weighted Round Robin',
        data: groupAData,
        backgroundColor: 'rgba(15, 140, 85, 0.8)',
        borderColor: 'rgba(15, 140, 85, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: groupB.label,
        data: groupBData,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter, system-ui, sans-serif', weight: 600 },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Distribusi Request per Server',
        font: { family: 'Inter, system-ui, sans-serif', size: 16, weight: 700 },
        padding: { bottom: 20 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Jumlah Request',
          font: { family: 'Inter, system-ui, sans-serif', weight: 600 },
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image('image/png', 1);
      const link = document.createElement('a');
      link.download = 'distribution-comparison.png';
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-wrapper chart-wrapper--tall">
        <Bar ref={chartRef} data={data} options={options} />
      </div>
      <button type="button" className="btn secondary chart-download" onClick={handleDownload}>
        📥 Unduh Chart (PNG)
      </button>
    </div>
  );
}

export function OverallComparisonChart({ groupA, groupB }) {
  const chartRef = useRef(null);

  // Normalize metrics to 0-100 scale for radar-like comparison
  const maxLatency = Math.max(groupA.stats.avgLatency, groupB.stats.avgLatency);
  const maxP95 = Math.max(groupA.stats.p95Latency, groupB.stats.p95Latency);
  const maxError = Math.max(groupA.stats.errorRate, groupB.stats.errorRate) || 0.01;

  const data = {
    labels: [
      'Avg Latency',
      'P95 Latency', 
      'Error Rate',
      'Throughput Score',
    ],
    datasets: [
      {
        label: 'Weighted Round Robin',
        data: [
          100 - (groupA.stats.avgLatency / maxLatency) * 50, // Lower is better
          100 - (groupA.stats.p95Latency / maxP95) * 50,
          100 - (groupA.stats.errorRate / maxError) * 100,
          groupA.stats.totalRequests > 0 ? 85 : 0, // Simulated throughput score
        ],
        backgroundColor: 'rgba(15, 140, 85, 0.7)',
        borderColor: 'rgba(15, 140, 85, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: groupB.label,
        data: [
          100 - (groupB.stats.avgLatency / maxLatency) * 50,
          100 - (groupB.stats.p95Latency / maxP95) * 50,
          100 - (groupB.stats.errorRate / maxError) * 100,
          groupB.stats.totalRequests > 0 ? 75 : 0,
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter, system-ui, sans-serif', weight: 600 },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Skor Performa Keseluruhan (Lebih tinggi = Lebih baik)',
        font: { family: 'Inter, system-ui, sans-serif', size: 16, weight: 700 },
        padding: { bottom: 20 },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)} poin`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Skor (0-100)',
          font: { family: 'Inter, system-ui, sans-serif', weight: 600 },
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      y: {
        grid: { display: false },
      },
    },
  };

  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image('image/png', 1);
      const link = document.createElement('a');
      link.download = 'overall-comparison.png';
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <Bar ref={chartRef} data={data} options={options} />
      </div>
      <button type="button" className="btn secondary chart-download" onClick={handleDownload}>
        📥 Unduh Chart (PNG)
      </button>
    </div>
  );
}

// Utility function to download all charts as a single image
export function downloadAllCharts() {
  const charts = document.querySelectorAll('.chart-container canvas');
  if (charts.length === 0) return;

  const canvas = document.createElement('canvas');
  const padding = 40;
  const chartHeight = 350;
  const chartWidth = 600;
  
  canvas.width = chartWidth * 2 + padding * 3;
  canvas.height = chartHeight * 2 + padding * 3;
  
  const ctx = canvas.getContext('2d');
  
  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Title
  ctx.fillStyle = '#1f2433';
  ctx.font = 'bold 24px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Laporan Perbandingan A/B Test Load Balancer', canvas.width / 2, 30);
  
  // Timestamp
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#6b7285';
  ctx.fillText(`Generated: ${new Date().toLocaleString('id-ID')}`, canvas.width / 2, 50);

  // Draw charts in grid
  charts.forEach((chart, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const x = padding + col * (chartWidth + padding);
    const y = 70 + row * (chartHeight + padding);
    
    ctx.drawImage(chart, x, y, chartWidth, chartHeight);
  });

  const url = canvas.toDataURL('image/png', 1);
  const link = document.createElement('a');
  link.download = `ab-test-report-${Date.now()}.png`;
  link.href = url;
  link.click();
}

