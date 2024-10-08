import React from "react";
import useAuthStore from "@/stores/auth-store";
import {
  PrincipalItems,
  StudentItems,
  TeacherItems,
} from "@/constants/sidebar-items";
import { Link, useLocation } from "react-router-dom";
import { LucideProps } from "lucide-react";
import { useSidebar } from "@/stores/sidebar-store";

const Sidebar = () => {
  const { isCollapsed } = useSidebar();
  const { user } = useAuthStore();

  let sidebarItems: {
    label: string;
    href: string;
    icon: React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
  }[] = [];
  switch (user?.role) {
    case "principal":
      sidebarItems = PrincipalItems;
      break;
    case "teacher":
      sidebarItems = TeacherItems;
      break;
    case "student":
      sidebarItems = StudentItems;
      break;
    default:
      sidebarItems = [];
  }

  return (
    <div
      className={`bg-white h-screen border-r-[1px] flex flex-col p-4 ${
        isCollapsed ? "w-20" : "w-64"
      } transition-width duration-300`}
    >
      <div className="mt-10 flex flex-col space-y-4">
        {sidebarItems.map((item, index) => (
          <SidebarItem
            key={index}
            label={item.label}
            icon={item.icon}
            href={item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  label: string;
  isCollapsed: boolean;
  href: string;
}

const SidebarItem = ({
  icon: Icon,
  label,
  isCollapsed,
  href,
}: SidebarItemProps) => {
  const pathname = useLocation().pathname;
  // console.log(pathname);

  return (
    <Link
      className={`flex items-center justify-start transition rounded-md p-2 border-[1px] ${
        href == pathname && "bg-primary text-white"
      }`}
      to={href}
    >
      <div className="p-2">{<Icon className="size-4" />}</div>
      {!isCollapsed && <span className="">{label}</span>}
    </Link>
  );
};

export default Sidebar;
