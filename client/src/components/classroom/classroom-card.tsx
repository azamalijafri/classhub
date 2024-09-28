import { EllipsisVerticalIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios-instance";
import { apiUrls } from "@/constants/api-urls";
import { useModal } from "@/stores/modal-store";
import { useRefetchQuery } from "@/hooks/useRefetchQuery";
import useAuthStore from "@/stores/auth-store";

const ClassroomCard = ({ classroom }: { classroom: IClassroom }) => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { user } = useAuthStore();
  const location = useLocation();
  const path = location.pathname.split("/").pop();
  let navigateLink = "";
  switch (path) {
    case "":
      navigateLink = `/class/${classroom?._id}/timetable`;
      break;
    case "attendance":
      navigateLink = `/attendance/${classroom._id}`;
  }
  const refetchQuery = useRefetchQuery();

  const handleRemove = async () => {
    const response = await axiosInstance.delete(
      `${apiUrls.classroom?.removeClassroom}/${classroom?._id}`
    );
    if (response) {
      refetchQuery(["classrooms"]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-primary text-white rounded-t-md relative">
        {user?.role == "principal" && (
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
                      classroomId: classroom?._id,
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
        )}

        <span
          onClick={() => navigate(navigateLink)}
          className="hover:underline underline-offset-2 cursor-pointer transition w-full text-ellipsis overflow-hidden whitespace-nowrap"
        >
          {classroom?.name}
        </span>
      </CardHeader>
      <Separator />
      {path != "attendance" && (
        <CardContent className="py-2">
          <span className="text-sm font-medium">
            {classroom?.mentor
              ? `Assigned to ${classroom?.mentor?.name}`
              : "No teacher assigned"}
          </span>
        </CardContent>
      )}
    </Card>
  );
};

export default ClassroomCard;
