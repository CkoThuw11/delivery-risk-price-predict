import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp,
  ChevronDown,
  ChevronRight,
  LogOut,
  CheckSquare,
  Activity,
} from "lucide-react";

function AdminSidebar({ activeMenuItem, setActiveMenuItem, onLogout }) {
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState({ statistics: true });

  const toggleMenu = (menu) => {
    setExpandedMenu(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <div className="w-64 bg-secondary-3 text-white flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b ">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold block">ADMIN</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        
        {/* Overview */}
        <button
          onClick={() => {
            setActiveMenuItem("overview");
            navigate("/mainpage");
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeMenuItem === "overview"
              ? "bg-secondary-3 color-primary-3 font-bold"
              : "text-white bg-secondary-3 font-bold hover:bg-teal-700"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Overview</span>
        </button>

        {/* Statistics Detail */}
        <div>
          <button
            onClick={() => {
              toggleMenu("statistics");
              setActiveMenuItem("statistics");
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
              activeMenuItem.startsWith("statistics")
                ? "bg-secondary-3 color-primary-3 font-bold"
                : "text-white bg-secondary-3 font-bold hover:bg-teal-700"
            }`}
          >
            <div className="flex items-center gap-3">
               <BarChart3
                  className={`w-5 h-5 ${
                    activeMenuItem.startsWith("statistics")
                      ? "text-primary-3"
                      : "text-white"
                  }`}
                />
                <span
                  className={`font-bold ${
                    activeMenuItem.startsWith("statistics")
                      ? "text-primary-3"
                      : "text-white"
                  }`}
                >
                  Statistics Detail
                </span>
            </div>
            {expandedMenu.statistics ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Submenu */}
          {expandedMenu.statistics && (
            <div className="ml-4 mt-2 space-y-1 border-l-1 border-[var(--primary-color-3)] pl-4">
              <button
                onClick={() => {
                  setActiveMenuItem("statistics-sales");
                  navigate("/statistics/sales");
                }}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                  activeMenuItem === "statistics-sales"
                    ? "bg-secondary-3 color-primary-3 font-bold"
                    : "text-white bg-secondary-3 font-bold hover:bg-teal-700"
                }`}
              >
                Sales Analytics
              </button>
              <button
                onClick={() => {
                  setActiveMenuItem("statistics-delivery");
                  navigate("/statistics/delivery");
                }}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                  activeMenuItem === "statistics-delivery"
                    ? "bg-secondary-3 color-primary-3 font-bold"
                    : "text-white bg-secondary-3 font-bold hover:bg-teal-700"
                }`}
              >
                Delivery Analytics
              </button>
            </div>
          )}
        </div>

        {/* Predicting */}
        <button
          onClick={() => {
            setActiveMenuItem("predicting");
            navigate("/predicting");
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeMenuItem === "predicting"
              ? "bg-secondary-3 color-primary-3 font-bold"
              : "text-white bg-secondary-3  font-bold hover:bg-teal-700"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="font-medium">Predicting</span>
        </button>
        
        {/* Divider */}
        <div className="my-4 border-t border-white"></div>

        {/* Info Card */}
        <div className="bg-white rounded-lg p-4 border border-2">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 color-secondary-3" />
            <span className="text-xs font-bold color-secondary-3">Quick Info</span>
          </div>
          <p className="text-xs color-secondary-3 leading-relaxed">
            Viewing overall and detail dashboards about order and testing predictions.
          </p>
        </div>
      </nav>
      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary-3"
        >
          <LogOut className="w-5 h-5 color-primary-3" />
          <span className="font-medium color-primary-3 font-bold">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;
