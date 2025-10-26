import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function HBarChart({ chartData, name}) {
  // Giả sử chartData là đối tượng như bạn gửi:
  // {
  //   chart_type: "bar_horizontal",
  //   label: "region",
  //   value: "sales",
  //   unit: "USD",
  //   data: [ { region: "US West", sales: 2200000 }, ... ]
  // }

  const labels = chartData.data.map((item) => item[chartData.label]);
  const values = chartData.data.map((item) => item[chartData.value]);

  const data = {
    labels,
    datasets: [
      {
        label: `Sum of ${chartData.value}`,
        data: values,
        backgroundColor: "rgba(54, 162, 235, 1)",
        borderWidth: 0,
      },
    ],
  };

  const options = {
    indexAxis: "y", // bar ngang
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // ẩn chú thích
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
          label: function (context) {
            // định dạng tooltip có dấu phẩy phân tách hàng nghìn
            return `${context.dataset.label}: ${context.formattedValue.toLocaleString()} ${chartData.unit}`;
          },
        },
      },
      datalabels: {
      display: false,
    },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: `Sum of ${chartData.value}`,
          font: {
            weight: "bold",
          },
        },
        ticks: {
          callback: (value) => `${(value / 1_000_000).toFixed(0)}M`, // ví dụ 2,000,000 -> 2M
        },
        grid: {
          drawBorder: false,
        },
      },
      y: {
        title: {
          display: true,
          text: chartData.label.replace("_", " "),
          font: {
            weight: "bold",
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Bar options={options} data={data} />
  );
}