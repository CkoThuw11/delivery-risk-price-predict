import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export default function BarChart({ chartData, name }) {
  console.log("chartData: ", chartData);
  const labels = chartData.data.map((item) => item[chartData.label]);
  const backgroundColors = [
    "rgba(255, 99, 132, 0.5)",
    "rgba(53, 162, 235, 0.5)",
  ];
  let datasets = [];

  datasets = [];
  chartData.value.forEach((val, index) => {
    let dataset = {};
    dataset.data = chartData.data.map((item) => item[val]);
    dataset.label = labels[index];
    dataset.backgroundColor = backgroundColors[index];
    datasets.push(dataset);
  });

  console.log("dataset: ", datasets);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: name,
      },
      datalabels: {
        display: false,
        align: "end",
      },
    },
  };
  const data = {
    labels,
    datasets: datasets,
  };

  return <Bar options={options} data={data} />;
}
