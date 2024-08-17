import React from "react";
import { Navbar } from "./navbar";
import Sidebar from "./sidebar";
import Loader from "./loader";
import { useSidebar } from "../stores/sidebar-store";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex">
      <div className="flex-1 flex flex-col">
        <div className="w-full border-b-[1px] border-gray-300 fixed bg-white z-50">
          <Navbar />
          <Loader />
        </div>
        <main className="flex mt-20">
          <div className="fixed">
            <Sidebar />
          </div>
          <div
            className={`${isCollapsed ? "ml-20" : "ml-64"} transition w-full`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
