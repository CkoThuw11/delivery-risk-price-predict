import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
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
  Legend
);


export default function LineChart({chartData, name}) {
  if (!chartData) return <p>Chart data is not available</p>
  const labels = chartData.data.map((item) => item[chartData.x_axis]);
  const dataValues = chartData.data.map((item) => (item[chartData.y_axis]));
  console.log("labels: ", labels);
    console.log("dataValues: ", dataValues);

  const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      display: false,
    },
    title: {
      display: true,
      text: name,
    },
     datalabels: {
      display: false,
    },
  },
};

const data = {
  labels,
  datasets: [
    {
      label: '',
      data: dataValues,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
  ],
};


  return <Line options={options} data={data}/>;
}
