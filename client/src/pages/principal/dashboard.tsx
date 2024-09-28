import ClassroomsGrid from "@/components/classroom/classrooms-grid";
import { apiUrls } from "@/constants/api-urls";
import axiosInstance from "@/lib/axios-instance";
import { useLoading } from "@/stores/loader-store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const PrincipalDashboard = () => {
  const { startLoading, stopLoading } = useLoading();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["classrooms"],
    queryFn: async () => {
      startLoading();
      const response = await axiosInstance.get(
        apiUrls.classroom.getAllClassrooms
      );
      stopLoading();
      return response.data.classrooms;
    },
  });

  useEffect(() => {
    document.title = "Dashboard | CloudCampus";
  }, []);

  if (!isLoading && data.length == 0)
    return (
      <div className="h-[calc(100vh-5rem)] w-full flex items-center justify-center">
        <span className="font-medium">You haven't created a class yet</span>
      </div>
    );
  return <ClassroomsGrid data={data} isLoading={isLoading} isError={isError} />;
};

export default PrincipalDashboard;
