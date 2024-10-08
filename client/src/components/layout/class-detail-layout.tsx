import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Button } from "../ui/button";
import { apiUrls } from "../../constants/api-urls";
import { useModal } from "../../stores/modal-store";
import useAuthStore from "@/stores/auth-store";
import { useApi } from "@/hooks/useApiRequest";
import SecondaryLoader from "../loader/secondary-loader";

const ClassTeacherButton = lazy(
  () => import("../teacher/class-teacher-button")
);

const tabs = [
  { label: "Timetable", path: "timetable" },
  { label: "Students", path: "students" },
  { label: "Attendance", path: "attendance" },
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
                <Suspense fallback={<SecondaryLoader />}>
                  <ClassTeacherButton classroom={data?.classroom} />
                </Suspense>
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
              {data?.classroom?.mentor?.name}
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default ClassDetailsLayout;
