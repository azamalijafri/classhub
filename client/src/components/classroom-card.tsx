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
import axiosInstance from "@/lib/axios-instance";
import { apiUrls } from "@/constants/api-urls";
import { useModal } from "@/stores/modal-store";
import { useRefetchQuery } from "@/hooks/useRefetchQuery";

const ClassroomCard = ({ classroom }: { classroom: IClassroom }) => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const refetchQuery = useRefetchQuery();

  const handleRemove = async () => {
    const response = await axiosInstance.delete(
      `${apiUrls.school.removeClassroom}/${classroom._id}`
    );
    if (response) {
      refetchQuery(["classrooms"]);
    }
  };

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
              <DropdownMenuItem
                onClick={() =>
                  openModal("upsert-classroom", {
                    classId: classroom._id,
                  })
                }
              >
                Edit
              </DropdownMenuItem>
              <Separator />
              <DropdownMenuItem
                onClick={() =>
                  openModal("confirm", { performingAction: handleRemove })
                }
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <span
          onClick={() => navigate(`/class/${classroom._id}/timetable`)}
          className="hover:underline underline-offset-2 cursor-pointer transition w-fit"
        >
          {classroom.name}
        </span>
      </CardHeader>
      <Separator />
      <CardContent className="py-2">
        <span className="text-sm font-medium">
          {classroom.teacher
            ? `Assigned to ${classroom.teacher?.name}`
            : "No teacher assigned"}
        </span>
      </CardContent>
    </Card>
  );
};

export default ClassroomCard;
