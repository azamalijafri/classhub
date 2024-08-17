import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../lib/axios-instance";
import { apiUrls } from "../constants/api-urls";
import { useModal } from "../stores/modal-store";

const tabs = [
  { label: "Timetable", path: "timetable" },
  { label: "Students", path: "students" },
];

const ClassDetailsLayout = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const pathname = useLocation().pathname.split("/").reverse()[0];
  const { openModal } = useModal();

  const [classroom, setClassroom] = useState<IClassroom | null>(null);

  const fetchClassDetails = useCallback(async () => {
    const response = await axiosInstance.get(
      `${apiUrls.classroom.getClassroomDetails}/${classId}`
    );
    if (response) {
      console.log(response.data);

      setClassroom(response.data.classroom);
    }
  }, [classId]);

  useEffect(() => {
    fetchClassDetails();
  }, [fetchClassDetails]);

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
        <div>
          {classroom?.teacher ? (
            <div className="bg-primary px-4 py-2 rounded-md text-white">
              <span>{classroom.teacher.name}</span>
            </div>
          ) : (
            <Button
              size={"sm"}
              onClick={() => openModal("assign-teacher", { classId })}
            >
              Assign Teacher
            </Button>
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
