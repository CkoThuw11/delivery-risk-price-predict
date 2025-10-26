import React, {useRef} from 'react';
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import {Pie} from 'react-chartjs-2';

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
    return <p>Data is not available</p>
  }


  const backgroundColors = labels.map((_, index) => {
    return backgroundColor[index]
  });

  const borderColors = labels.map((_, index) => {
    return borderColor[index]
  });


  const data = {
    labels,
    datasets: [
      {
        label: chartData.value && chartData.unit
        ? capitalize(`${chartData.value} (${chartData.unit})`)
        : capitalize(`${chartData.value}`),
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
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
      datalabels: {
        color: '#000',
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