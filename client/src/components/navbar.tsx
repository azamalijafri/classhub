import { MenuIcon, PresentationIcon } from "lucide-react";
import { UserAvatar } from "./user-avatar";
import CreateButton from "./create-button";

export const Navbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <div className="flex h-20 justify-between py-8 px-8 w-full mx-auto items-center">
      <div className="flex items-center gap-x-6">
        <div
          onClick={toggleSidebar}
          className="cursor-pointer rounded-full hover:bg-muted transition p-2"
        >
          <MenuIcon />
        </div>
        <div className="flex gap-x-2 items-center text-primary">
          <PresentationIcon />
          <h1 className="text-xl text-primary">Classroom</h1>
        </div>
      </div>
      <div className="flex gap-x-4">
        <CreateButton />
        <UserAvatar />
      </div>
    </div>
  );
};
