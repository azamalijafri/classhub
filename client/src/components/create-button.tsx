import {
  BellElectricIcon,
  BookTypeIcon,
  Plus,
  SchoolIcon,
  UsersIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { ModalType, useModal } from "../stores/modal-store";

const navs = [
  {
    label: "Classroom",
    key: "upsert-classroom",
    icon: SchoolIcon,
  },
  {
    label: "Teacher",
    key: "create-teacher",
    icon: BookTypeIcon,
  },
  {
    label: "Student",
    key: "create-student",
    icon: UsersIcon,
  },
  {
    label: "Subject",
    key: "create-subject",
    icon: BellElectricIcon,
  },
];

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
        {navs.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onClick={() => openModal(item.key as ModalType)}
          >
            <div className="flex gap-x-4 justify-between items-center">
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateButton;
