import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";
import BarChart from "../components/Charts/BarChart"; 
import PieChart from "../components/Charts/PieChart";
import { 
  BarChart3, 
  ChevronDown,
  Loader2,
  AlertCircle,
  ChartPie,
  ChartNoAxesCombined,
  ChartColumnBig,
  BadgeDollarSign,
  Truck
} from "lucide-react";

function StatisticsDetail() {
  const { category } = useParams(); 
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeChart, setActiveChart] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setActiveChart(null);
    setChartData(null);
    setSelectedMarket(null);
  }, [category]);
  const iconMap = {
    "SalesBy Payment": BarChart3,
    "Sales By Market": ChartPie,
    "Sales By Region": ChartColumnBig,
    "Late Delivery By Region": ChartColumnBig,
    "Shipping mode usage distribution": ChartPie,
    "Delivery Performance By Top 10 Departments": ChartNoAxesCombined,
    "Delivery Performance By Top 10 Categories": ChartNoAxesCombined,
  };
  const fetchChartData = async (chartItem) => {
    if (!chartItem) return;
    setLoading(true);
    setError(null);
    try {
      const API_URL = `http://127.0.0.1:8000/order/stats/${chartItem.api}/`;
      const response = await apiFetch(API_URL, {
        method: "GET"
      })
      if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Chart data received:", data);
      setChartData(data); 
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load chart data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (chartItem) => {
    if (chartItem.dropdown) {
      if (activeChart?.api === chartItem.api && !loading) {
        setShowDropdown((prev) => !prev);
        return;
      }

      setActiveChart(chartItem);
      setShowDropdown(true);
      return;
    }

    setActiveChart(chartItem);
    setSelectedMarket(null);
    await fetchChartData(chartItem);
  };

  const handleDropdownClick = async (chartItem, market) => { 
    if (activeChart?.api !== chartItem.api || selectedMarket?.market !== market) {
        setActiveChart(chartItem); 
        setSelectedMarket({ market: market, data: null }); 
        await fetchChartData(chartItem); 
    }
  };

  const handleSelectMarket = (market) => {
    if (!chartData || !activeChart) return;
    const chartObj = chartData["charts"];
    if (!chartObj || !chartObj.data[market]) return;
    const selected = {
      ...chartObj,
      data: chartObj.data[market],
      market: market, 
    };
    setSelectedMarket(selected);
  };

  useEffect(() => {
    if (activeChart?.dropdown && chartData && selectedMarket?.market) {
        handleSelectMarket(selectedMarket.market);
    } else if (activeChart?.dropdown && chartData) {
        const firstMarket = activeChart.dropdown[0];
        handleSelectMarket(firstMarket); 
    }
  }, [chartData, activeChart]); 


  const chartConfigs = {
    sales: [
      { name: "Sales By Payment", api: "sales-by-payment", displayName: "Sales By Payment" },
      { name: "Sales By Market", api: "sales-by-market", displayName: "Sales By Market" },
      { name: "Sales By Region", api: "sales-by-region", displayName: "Sales By Region", dropdown: ["Africa", "Europe", "LATAM", "Pacific Asia", "USCA"] },
    ],
    delivery: [
      { name: "Late Delivery By Region", api: "latedelivery-by-region", displayName: "Late Delivery By Region", dropdown: ["Africa", "Europe", "LATAM", "Pacific Asia", "USCA"] },
      { name: "Shipping m<de Usage Distribution", api: "orders-by-shippingmode", displayName: "Shipping Mode Usage Distribution" },
      { name: "Delivery Performance By Top 10 Departments", api: "deliveryperformance-by-top10-departments", displayName: "Delivery Performance By Top 10 Departments" },
      { name: "Delivery Performance By Top 10 Categories", api: "deliveryperformance-by-categories", displayName: "Delivery Performance By Top 10 Categories" },
    ],
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-600">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
          <p className="font-medium">Loading chart data...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-600">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="font-medium">{error}</p>
        </div>
      );
    }
    if (!chartData || !activeChart) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
          <p className="font-semibold text-lg">Please choose your chart!</p>
          <p className="text-sm text-gray-400 mt-2">Select an option above to visualize data.</p>
        </div>
      );
    }
    const chartObj = chartData["charts"];
    if (!chartObj) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-orange-600">
          <AlertCircle className="w-12 h-12 text-orange-500 mb-4" />
          <p className="font-medium">No data found for this chart.</p>
        </div>
      );
    }
    
    const dataToRender = activeChart.dropdown && selectedMarket 
        ? selectedMarket 
        : chartObj;
    
    if (activeChart.dropdown && !selectedMarket?.market && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <ChevronDown className="w-16 h-16 text-teal-400 mb-4" />
                <p className="font-medium text-lg">Select a region from the dropdown</p>
                <p className="text-gray-400 text-sm mt-2">Choose a market to display data</p>
            </div>
        );
    }

    switch (dataToRender.chart_type) {
      case "bar": 
        return (
            <div className="w-full h-full flex items-center justify-center">
                <BarChart chartData={dataToRender} />
            </div>
        );
      case "pie": 
        return (
            <div className="w-full h-full flex items-center justify-center">
                <PieChart chartData={dataToRender} />
            </div>
        );
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-gray-600">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <p className="font-medium">Unsupported chart type</p>
        </div>
      );
    }
  };

    const renderChartButtons = (chartCategory) => {
    const items = chartConfigs[chartCategory];
    if (!items) return null;

    return (
      <div className="flex flex-wrap gap-3 mb-6">
        {items.map((item, idx) => {
          const IconComponent = iconMap[item.displayName] || BarChart3;

          return (
            <div key={idx} className="relative">
              <button
                onClick={() => handleClick(item)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all duration-300 shadow-md text-base ${
                  activeChart?.api === item.api
                    ? "bg-secondary-3 text-white"
                    : "bg-white color-secondary-3 border-secondary-color-3 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{item.displayName}</span>

                {item.dropdown && (
                  <ChevronDown
                    className={`w-4 h-4 ml-1 transition-transform ${
                      activeChart?.api === item.api &&
                      item.dropdown.includes(selectedMarket?.market)
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                )}
              </button>

              {/* Dropdown */}
              {item.dropdown && activeChart?.api === item.api && showDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-1 z-10 min-w-[180px]">
                  {item.dropdown.map((market, mIdx) => (
                    <button
                      key={mIdx}
                      onClick={() => handleDropdownClick(item, market)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                        selectedMarket?.market === market
                          ? "bg-teal-100 text-teal-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {market}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const title = category === 'sales' ? 'Sales Analytics' : 'Delivery Analytics';

  const TitleIcon = category === "sales" ? BadgeDollarSign: Truck;

  return (
    <div className="flex-1 flex flex-col p-6 bg-gray-50 h-screen overflow-hidden">
      {/* Analytics Section */}
      <div className="mb-0">
        <h2 className="text-xl font-bold color-secondary-3 mb-3 flex items-center gap-2">
          <TitleIcon className="w-8 h-8 color-primary-3" /> 
          {title}
        </h2>
        {renderChartButtons(category)}
      </div>

      {/* Chart Display Area */}
      <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-200"> 
        {/* Chart Header */}
        <div className="bg-secondary-3 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {activeChart?.displayName || "Data Visualization"}
          </h3>
          {selectedMarket?.market && (
            <span className="text-lg color-secondary-3 bg-white font-bold  px-3 py-1 rounded-full">
              Region: {selectedMarket.market}
            </span>
          )}
        </div>
        <div className="flex-1 p-6 overflow-hidden relative"> 
          {renderChart()}
        </div>
      </div>
    </div>
  );
}

export default StatisticsDetail;
