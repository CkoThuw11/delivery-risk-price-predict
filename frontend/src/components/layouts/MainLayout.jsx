import { Outlet, useNavigate } from "react-router-dom";
import { TabButton } from "../ui/TabButton";
import { useState } from "react";

const MainLayout = (props) => {
  const [activeTab, setActiveTab] = useState("statistics");
  const navigate = useNavigate();

  return (
    <>
      <div className="min-h-screen bg-[#ffffff] flex flex-col p-0">
        {/* --- Header Tabs --- */}
        <div className="flex items-center justify-center space-x-10 h-16 bg-secondary-1">
          <TabButton
            label="Statistics"
            isActive={activeTab === "statistics"}
            onClick={() => {
              setActiveTab("statistics");
              navigate("/mainpage");
            }}
          />
          <TabButton
            label="Predicting"
            isActive={activeTab === "predicting"}
            onClick={() => {
              setActiveTab("predicting");
              navigate("/predicting");
            }}
          />
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
