import React, { useState } from "react";
import Input from "../components/ui/Input";
import { useNavigate } from "react-router-dom";
import {TabButton, TabStatistics} from "../components/ui/TabButton";
import LineChart from "../components/Charts/LineChart";
import StackedBarChart from "../components/Charts/BarChart";
import PieChart from "../components/Charts/PieChart";

function StatisticsPage() {
  const [activeTab, setActiveTab] = useState("statistics");
  const [activeTabStatistic, setActiveTabStatistic] = useState("detail");

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col p-0">
      {/* --- Header Tabs --- */}
      <div className="flex items-center justify-center space-x-10 h-16 bg-secondary-1">
        <TabButton
          label="Statistics"
          isActive={activeTab === "statistics"}
          onClick={() => setActiveTab("statistics")}
        />
        <TabButton
          label="Predicting"
          isActive={activeTab === "predicting"}
          onClick={() => setActiveTab("predicting")}
        />
      </div>

      <div className="flex items-center justify-center space-x-10 h-full bg-secondary-1 mt-2">
        <TabStatistics
          label="Overview"
          isActive={activeTabStatistic === "overview"}
          onClick={() => setActiveTabStatistic("overview")}
        />

        <TabStatistics
          label="Detail"
          isActive={activeTabStatistic === "detail"}
          onClick={() => setActiveTabStatistic("detail")}
        />


      </div>


      {/* --- Main layout --- */}
      <div className="flex flex-1 overflow-hidden mt-2">
        {/* --- Left Sidebar --- */}
        <div className="w-1/6 bg-primary-2 flex flex-col mr-2 border border-black ">
          <div>
            <div className="bg-primary-1 text-white text-center font-semibold py-1 border-b-1 border-black ">
              Sales
            </div>

            {/* Function Buttons */}
            <div className="flex flex-col gap-4 p-3 items-center justify-center mt-2">
              {[
                "Sale by payment",
                "Sales by market",
                "Sales by region",
              ].map((label, index) => (
                <button
                  key={index}
                  className="bg-primary-1 text-white rounded-md py-1 px-2 text-center shadow hover:bg-[#40613f] transition w-50 h-14   "
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          

          <div className="mt-2">
            <div className="bg-primary-1 text-white text-center font-semibold py-1 border-b-1 border-black ">
              Delivery
            </div>

            {/* Function Buttons */}
            <div className="flex flex-col gap-4 p-3 items-center justify-center mt-2">
              {[
                "Late delivery by region",
                "Shipping mode usage distribution",
                "Delivery performance by top 10 departments",
                "Delivery performance by top 10 categories"
              ].map((label, index) => (
                <button
                  key={index}
                  className="bg-primary-1 text-white rounded-md py-1 px-4 text-center shadow hover:bg-[#40613f] transition w-50 h-14 "
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
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
              
              <StackedBarChart/>
              
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
    </div>
  );
}

export default StatisticsPage;