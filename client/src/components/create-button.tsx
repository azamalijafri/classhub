import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useModal } from "../stores/modal-store";

const CreateButton = () => {
  const { openModal } = useModal();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center gap-x-2">
          <span>Add</span>
          <Plus className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => openModal("upsert-classroom")}>
          Classroom
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openModal("create-teacher")}>
          Teacher
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openModal("create-student")}>
          Student
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateButton;
