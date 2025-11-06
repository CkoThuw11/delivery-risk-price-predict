import { Outlet, useNavigate } from "react-router-dom";
import { TabButton } from "../ui/TabButton";
import { useState } from "react";

const MainLayout = (props) => {
  const [activeTab, setActiveTab] = useState("statistics");
  const navigate = useNavigate();
  const handleLogoutButton = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };
  return (
    <div>
      <div className="min-h-screen bg-[#ffffff] flex flex-col p-0">
        {/* --- Header Tabs --- */}
        <div className="flex items-center justify-center space-x-10 h-16 bg-secondary-1 relative">
          <div className="p-0 ">
            <button
              className="absolute top-[11px] right-[11px] border bg-primary-2 text-black pr-4 pl-4 pt-2 pb-2 rounded-xl"
              onClick={handleLogoutButton}
            >
              Logout
            </button>
          </div>
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
    </div>
  );
};

export default MainLayout;
