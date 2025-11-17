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
    "rgba(237, 144, 14, 0.7)",      
    "rgba(53, 162, 235, 0.5)",     
    "rgba(75, 192, 192, 0.5)",      
    "rgba(255, 99, 132, 0.5)",      
    "rgba(153, 102, 255, 0.5)",     
    "rgba(255, 159, 64, 0.5)",      
  ];

  const datasets = chartData.value.map((valueField, index) => {
    return {
      label: capitalize(valueField), 
      data: chartData.data.map((item) => item[valueField]),
      backgroundColor: backgroundColors[index % backgroundColors.length],
      borderColor: backgroundColors[index % backgroundColors.length].replace("0.7", "1").replace("0.5", "1"),
      borderWidth: 1,
    };
  });

  console.log("datasets: ", datasets);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 1200,
      easing: "easeInOutQuart",
      animateScale: true,
      animateRotate: true,
    },
    transition: {
      active: {
        animation: {
          duration: 400
        }
      }
    },
    plugins: {
      legend: {
        position: "top",
        display: true, 
      },
      title: {
        display: false, 
        text: name || chartData.chart_type,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        }
      }
    }
  };

  const data = {
    labels,
    datasets: datasets,
  };

  return <Bar options={options} data={data} />;
}