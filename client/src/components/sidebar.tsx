/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { useSidebar } from "../stores/sidebar-store";

const Sidebar = () => {
  const { isCollapsed } = useSidebar();
  return (
    <div
      className={`bg-white h-screen border-r-[1px] flex flex-col p-4 ${
        isCollapsed ? "w-20" : "w-64"
      } transition-width duration-300`}
    >
      <div className="mt-10 flex flex-col space-y-4"></div>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const SidebarItem = ({ icon, label, isCollapsed }: SidebarItemProps) => (
  <div className="flex items-center">
    <div className="p-2">{icon}</div>
    {!isCollapsed && <span className="ml-4">{label}</span>}
  </div>
);

export default Sidebar;
