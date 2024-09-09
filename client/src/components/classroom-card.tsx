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
import { useShowToast } from "@/hooks/useShowToast";
import axiosInstance from "@/lib/axios-instance";
import { apiUrls } from "@/constants/api-urls";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/stores/modal-store";

const ClassroomCard = ({ classroom }: { classroom: IClassroom }) => {
  const navigate = useNavigate();
  const { showToast } = useShowToast();
  const { openModal } = useModal();

  const queryClient = useQueryClient();

  const handleRemove = async () => {
    const response = await axiosInstance.delete(
      `${apiUrls.classroom.removeClassroom}/${classroom._id}`
    );
    if (response) {
      queryClient.refetchQueries({ queryKey: ["classrooms"] });

      showToast({
        title: "Request Success",
        description: "Classroom has been deleted successfully!",
      });
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
