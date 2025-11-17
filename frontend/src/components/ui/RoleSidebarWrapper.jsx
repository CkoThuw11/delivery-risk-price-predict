import React from "react";
import AdminSidebar from "./AdminSidebar";
import TrainerSidebar from "./TrainerSidebar";
import UserSidebar from "./UserSidebar";

function RoleSidebarWrapper({ userRole, activeMenuItem, setActiveMenuItem, onLogout }) {
  const role = userRole || localStorage.getItem("role");

  switch (role) {
    case "admin":
      return (
        <AdminSidebar
          activeMenuItem={activeMenuItem}
          setActiveMenuItem={setActiveMenuItem}
          onLogout={onLogout}
        />
      );
    case "trainer":
      return (
        <TrainerSidebar
          activeMenuItem={activeMenuItem}
          setActiveMenuItem={setActiveMenuItem}
          onLogout={onLogout}
        />
      );
    case "user":
      return (
        <UserSidebar
          activeMenuItem={activeMenuItem}
          setActiveMenuItem={setActiveMenuItem}
          onLogout={onLogout}
        />
      );
    default:
      return (
        <UserSidebar
          activeMenuItem={activeMenuItem}
          setActiveMenuItem={setActiveMenuItem}
          onLogout={onLogout}
        />
      );
  }
}

export default RoleSidebarWrapper;