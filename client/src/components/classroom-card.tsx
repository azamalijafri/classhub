import { EllipsisVerticalIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const ClassroomCard = ({ classroom }: { classroom: IClassroom }) => {
  const navigate = useNavigate();

  // const handleRemove = async() => {
  //
  // }

  return (
    <Card className="w-full">
      <CardHeader className="bg-primary text-white rounded-t-md relative">
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none focus-within:outline-none">
              <div className=" size-6 rounded-full cursor-pointer">
                <EllipsisVerticalIcon className="size-5 focus:outline-none" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <span
          onClick={() => navigate(`/class/${classroom._id}`)}
          className="hover:underline underline-offset-2 cursor-pointer transition"
        >
          {classroom.name}
        </span>
      </CardHeader>
      <Separator />
      <CardContent className="py-2">
        <span className="text-sm">
          {classroom.teacher ? classroom.teacher?.name : "No teacher assigned"}
        </span>
      </CardContent>
    </Card>
  );
};

export default ClassroomCard;
