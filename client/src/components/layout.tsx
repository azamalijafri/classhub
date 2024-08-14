import React, { useState } from "react";
import { Navbar } from "./navbar";
import Sidebar from "./sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex">
      <div className="flex-1 flex flex-col">
        <div className="w-full border-b-[1px] border-gray-300 fixed bg-white">
          <Navbar toggleSidebar={handleToggle} />
        </div>
        <main className="flex mt-20">
          <div className="fixed">
            <Sidebar isCollapsed={isCollapsed} onToggle={handleToggle} />
          </div>
          <div className={`${isCollapsed ? "ml-20" : "ml-64"} transition`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
