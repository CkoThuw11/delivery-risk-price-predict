import React, { useEffect, useState } from "react";
import axios from "axios";
import BarChart from "../components/Charts/BarChart";
import PieChart from "../components/Charts/PieChart";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import ChartMenu from "../components/ui/ChartMenu";

function StatisticsDetail() {
  const [activeChart, setActiveChart] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchChartData = async (chartItem) => {
    if (!chartItem) return;
    try {
      const API_URL = `http://127.0.0.1:8000/order/stats/${chartItem.api}/`;
      const res = await axios.get(API_URL);
      console.log(res.data);
      setChartData(res.data);
    } catch (err) {
      console.error("Lỗi khi fetch dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleClick = async (chartItem) => {
    setActiveChart(chartItem);
    setSelectedMarket(null);
    if (chartItem.dropdown) return;
    await fetchChartData(chartItem);
  };

  const handleDropdownClick = async (chartItem, market) => {
    // Luôn fetch API cha trước
    await fetchChartData(chartItem);
    // Sau khi có chartData => xử lý chọn vùng
    handleSelectMarket(market);
  };

  const handleSelectMarket = (market) => {
    if (!chartData || !activeChart) return;

    const chartObj = chartData["charts"];
    if (!chartObj || !chartObj.data[market]) return;

    const selected = {
      ...chartObj,
      data: chartObj.data[market],
    };
    setSelectedMarket(selected);
  };

  const chartConfigs = {
    sales: [
      { name: "Sales by payment", api: "sales-by-payment" },
      { name: "Sales by market", api: "sales-by-market" },
      {
        name: "Sales by region",
        api: "sales-by-region",
        icon: ChevronDownIcon,
        dropdown: ["Africa", "Europe", "LATAM", "Specific Asia", "USCA"],
      },
    ],
    delivery: [
      {
        name: "Late delivery by region",
        api: "latedelivery-by-region",
        icon: ChevronDownIcon,
        dropdown: ["Africa", "Europe", "LATAM", "Specific Asia", "USCA"],
      },
      {
        name: "Shipping mode usage distribution",
        api: "orders-by-shippingmode",
      },
      {
        name: "Delivery performance by top 10 departments",
        api: "deliveryperformance-by-top10-departments",
      },
      {
        name: "Delivery performance by top 10 categories",
        api: "deliveryperformance-by-categories",
      },
    ],
  };

  const renderChart = () => {
    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (!chartData || !activeChart) return <p>Chưa có dữ liệu để hiển thị</p>;

    const chartObj = chartData["charts"];
    if (!chartObj) return <p>Không tìm thấy dữ liệu cho chart này</p>;

    // Chart có dropdown => cần chọn market
    if (activeChart.dropdown && !selectedMarket)
      return <p>Chọn một market trong dropdown để hiển thị</p>;

    // Nếu có selectedData (chart có dropdown)
    const dataToRender = selectedMarket || chartObj;

    switch (dataToRender.chart_type) {
      case "bar":
        return <BarChart chartData={dataToRender} />;
      case "pie":
        return <PieChart chartData={dataToRender} />;
      default:
        return <p>Chart type chưa hỗ trợ</p>;
    }
  };

  return (
    <>
      {/* --- Main layout --- */}
      <div className="flex flex-1 overflow-hidden mt-2">
        {/* --- Left Sidebar --- */}
        <div className="w-1/6 bg-primary-2 flex flex-col mr-2 border border-black ">
          <ChartMenu
            title="Sales"
            items={chartConfigs.sales}
            activeChart={activeChart}
            onButtonClick={handleClick}
            onDropdownClick={handleDropdownClick}
          />
          <ChartMenu
            title="Delivery"
            items={chartConfigs.delivery}
            activeChart={activeChart}
            onButtonClick={handleClick}
            onDropdownClick={handleDropdownClick}
          />
        </div>

        {/* --- Right Content Area --- */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Viz Data */}
          <div className="flex flex-col border border-black h-full">
            {/* header box */}

            <div className="bg-primary-1 text-white font-semibold px-3 py-1 border-b border-gray-400">
              Visualize data
            </div>

            {/* content box (show charts) */}

            <div className="flex items-center justify-center bg-white text-black w-full h-135 p-4">
              {renderChart()}

              {/* --- Bottom Images --- */}
              <img
                src="src/assets/img/statistic-page.png"
                alt="Icon"
                className="w-28 h-28 absolute bottom-1 right-1"
              />
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
    </>
  );
}

export default StatisticsDetail;
