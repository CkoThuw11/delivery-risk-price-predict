import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import RoleSidebarWrapper from "../ui/RoleSidebarWrapper";

function MainLayout() {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState("overview");

  const handleLogout = () => {
    
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("refreshToken");
    
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <RoleSidebarWrapper
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;