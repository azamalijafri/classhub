import { useCallback, useEffect, useState } from "react";
import { useLoading } from "../../stores/loader-store";
import axiosInstance from "../../lib/axios-instance";
import { apiUrls } from "../../constants/api-urls";
import ClassroomCard from "../../components/classroom-card";
import { useSidebar } from "../../stores/sidebar-store";

export const PrincipalDashboard = () => {
  const { startLoading, stopLoading } = useLoading();
  const [classrooms, setClassrooms] = useState([]);
  const { isCollapsed } = useSidebar();

  const fetchClassrooms = useCallback(async () => {
    startLoading();
    const response = await axiosInstance.get(
      apiUrls.classroom.getAllClassrooms
    );

    if (response) {
      setClassrooms(response.data.classrooms);
    }

    stopLoading();
  }, [startLoading, stopLoading]);

  useEffect(() => {
    fetchClassrooms();
    document.title = "Home";
  }, [fetchClassrooms]);

  return (
    <div className={`grid ${isCollapsed ? "grid-cols-5" : "grid-cols-4"}`}>
      {classrooms?.map((classroom: IClassroom) => (
        <ClassroomCard key={classroom._id} classroom={classroom} />
      ))}
    </div>
  );
};
