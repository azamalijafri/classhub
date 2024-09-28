import { MenuIcon, PresentationIcon } from "lucide-react";
import { useSidebar } from "../../stores/sidebar-store";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/auth-store";
import CreateButton from "../button/create-button";
import UserAvatar from "../button/user-avatar";

export const Navbar = () => {
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="flex h-20 justify-between py-8 px-8 w-full mx-auto items-center">
      <div className="flex items-center gap-x-6">
        <div
          onClick={toggleSidebar}
          className="cursor-pointer rounded-full hover:bg-muted transition p-2"
        >
          <MenuIcon />
        </div>
        <div
          className="flex gap-x-2 items-center text-primary cursor-pointer"
          onClick={() => navigate("/")}
        >
          <PresentationIcon />
          <h1 className="text-xl text-primary">Cloud Campus</h1>
        </div>
      </div>
      <div className="flex gap-x-4">
        {user?.role === "principal" && <CreateButton />}
        <UserAvatar />
      </div>
    </div>
  );
};
