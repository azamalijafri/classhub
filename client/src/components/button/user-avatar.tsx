import { useNavigate } from "react-router-dom";

import { useModal } from "@/stores/modal-store";
import useAuthStore from "@/stores/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

function UserAvatar() {
  const { profile, logout } = useAuthStore();
  const { openModal } = useModal();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"}>
          <span className="font-semibold cursor-pointer">{profile?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() =>
            openModal("confirm", { performingAction: handleLogout })
          }
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserAvatar;
