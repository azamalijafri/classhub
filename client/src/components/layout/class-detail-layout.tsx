import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, buttonVariants } from "../ui/button";
import { apiUrls } from "../../constants/api-urls";
import { useModal } from "../../stores/modal-store";
import { cn } from "@/lib/utils";
import ClassTeacherButton from "../teacher/class-teacher-button";
import useAuthStore from "@/stores/auth-store";
import { useEffect } from "react";
import { useApi } from "@/hooks/useApiRequest";

const tabs = [
  { label: "Timetable", path: "timetable" },
  { label: "Students", path: "students" },
];

const ClassDetailsLayout = () => {
  const navigate = useNavigate();
  const { classroomId } = useParams();
  const pathname = useLocation().pathname.split("/").reverse()[0];
  const { openModal } = useModal();
  const { user } = useAuthStore();

  const { fetchedData: data } = useApi({
    apiUrl: `${apiUrls.classroom.getClassroomDetails}/${classroomId}`,
    queryKey: [classroomId ?? "", "class-details"],
  });

  useEffect(() => {
    document.title = `${data?.classroom?.name} | CloudCampus`;
  }, [data?.classroom?.name]);

  return (
    <div>
      <div className="border-b-[1px] flex px-8 h-14 items-center justify-between">
        <div className="flex gap-x-8 h-full">
          {tabs.map((tab) => (
            <div
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`h-full px-4 flex items-center cursor-pointer hover:bg-muted transition ${
                pathname == tab.path
                  ? "border-b-2 border-black font-medium"
                  : ""
              }`}
            >
              <span>{tab.label}</span>
            </div>
          ))}
        </div>
        <div className={cn(buttonVariants({ variant: "outline" }))}>
          <h3>{data?.classroom?.name}</h3>
        </div>
        <div className="flex items-center gap-x-5">
          {user?.role === "principal" && (
            <div>
              <Button
                onClick={() => openModal("edit-timetable", { classroomId })}
              >
                Edit Timetable
              </Button>
            </div>
          )}
          {user?.role == "principal" ? (
            <div>
              {data?.classroom?.mentor ? (
                <ClassTeacherButton classroom={data?.classroom} />
              ) : (
                <div>
                  <Button
                    size={"sm"}
                    onClick={() => openModal("assign-teacher", { classroomId })}
                  >
                    Assign Teacher
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`flex text-sm items-center justify-center font-medium px-4 py-2 rounded-md border-[1px] border-primary w-full overflow-hidden text-ellipsis whitespace-nowrap`}
            >
              {data?.classroom?.teacher.name}
            </div>
          )}
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default ClassDetailsLayout;
