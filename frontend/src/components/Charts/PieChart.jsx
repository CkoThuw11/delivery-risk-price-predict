import { useRef } from 'react';
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);   

export default function PieChart({ chartData, name }) {
  const labels = chartData.data.map((item) => item[chartData.label]);
  const values = chartData.data.map((item) => item[chartData.value]);
  
  const backgroundColor = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ];
    const  borderColor= [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ]

  const chartRef = useRef(null);

  if (!chartData?.label || !chartData?.value) {
    return <p>Data is not available</p>;
  }

  const backgroundColors = labels.map((_, index) => {
    return backgroundColor[index % backgroundColor.length];
  });

  const borderColors = labels.map((_, index) => {
    return borderColor[index % borderColor.length];
  });

  const datasetLabel = chartData.value && chartData.unit
    ? capitalize(`${chartData.value} (${chartData.unit})`)
    : capitalize(`${chartData.value}`);

  const data = {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: chartData.title || name,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        color: '#000',
        font: {
          weight: 'bold',
          size: 11,
        },
        formatter: (value, context) => {
          const dataset = context.chart.data.datasets[0].data;
          const total = dataset.reduce((sum, val) => sum + val, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
      },
    },
  };

  return <Pie ref={chartRef} key={chartData.label} data={data} options={options} />;
}