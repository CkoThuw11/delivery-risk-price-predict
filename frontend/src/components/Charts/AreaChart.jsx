import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);


export default function AreaChart({ chartData, name }) {
  if (!chartData || !chartData.data) return null; // tránh lỗi khi chưa có dữ liệu

  // 🧩 Lấy labels và values từ dữ liệu API
  const labels = chartData.data.map((item) => item[chartData.x_axis]); // => ["2015-01", "2015-02", ...]
  const values = chartData.data.map((item) => item[chartData.y_axis] * 100); // => [12, 11, 14, ...]
  const remainingValues = values.map((v) => 100 - v); // phần còn lại
  // ⚙️ Cấu hình biểu đồ
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: name,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y.toFixed(2)}%`, // hiển thị giá trị % đẹp hơn
        },
      },
      datalabels: {
      display: false,
    },
    },
   
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value}%`,
        },
        title: {
          display: true,
          text: "% Late Risk",
        },
      },
    },
  };

  // 🎨 Dữ liệu biểu đồ
  const data = {
    labels,
    datasets: [
      {
        label: "1",
        data: remainingValues,
        borderColor: "rgba(17, 141, 255, 1)",
        backgroundColor: "rgba(17, 141, 255, 0.5)",
        fill: 1,
        borderWidth: 2, 
        order: 2,
      },
      {
        label: "0",
        data: values,
        borderColor: "rgba(160, 167, 216, 1)",
        backgroundColor: "rgba(160, 167, 216,0.6)",
        fill:"origin",
        borderWidth: 2,
        order: 1,
      },
    ],
  };

  return <Line options={options} data={data} />;
}