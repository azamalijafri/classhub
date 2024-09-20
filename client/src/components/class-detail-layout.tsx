import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, buttonVariants } from "./ui/button";
import { apiUrls } from "../constants/api-urls";
import { useModal } from "../stores/modal-store";
import { cn } from "@/lib/utils";
import ClassTeacherButton from "./class-teacher-button";
import { useFetchData } from "@/hooks/useFetchData";

const tabs = [
  { label: "Timetable", path: "timetable" },
  { label: "Students", path: "students" },
];

const ClassDetailsLayout = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const pathname = useLocation().pathname.split("/").reverse()[0];
  const { openModal } = useModal();

  const { data } = useFetchData(
    [classId ?? "", "class-details"],
    `${apiUrls.classroom.getClassroomDetails}/${classId}`
  );

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
          <div>
            <Button onClick={() => openModal("edit-timetable", { classId })}>
              Edit Timetable
            </Button>
          </div>
          <div>
            {data?.classroom?.teacher ? (
              <ClassTeacherButton classroom={data?.classroom} />
            ) : (
              <div>
                <Button
                  size={"sm"}
                  onClick={() => openModal("assign-teacher", { classId })}
                >
                  Assign Teacher
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default ClassDetailsLayout;
