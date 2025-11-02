// @ts-check
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { TabStatistics } from "../ui/TabButton";

const StatisticsLayout = () => {
  const [activeTabStatistic, setActiveTabStatistic] = useState("overview");

  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center justify-center space-x-10 h-full bg-secondary-1 mt-2">
        <TabStatistics
          label="Overview"
          isActive={activeTabStatistic === "overview"}
          onClick={() => {
            setActiveTabStatistic("overview");
            navigate("/mainpage");
          }}
        />

        <TabStatistics
          label="Detail"
          isActive={activeTabStatistic === "detail"}
          onClick={() => {
            setActiveTabStatistic("detail");
            navigate("/statistics-detail");
          }}
        />
      </div>

      <Outlet />
    </>
  );
};

export default StatisticsLayout;
