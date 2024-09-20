import { ClassroomsGrid } from "@/components/classrooms-grid";
import { apiUrls } from "@/constants/api-urls";
import axiosInstance from "@/lib/axios-instance";
import { useLoading } from "@/stores/loader-store";
import { useQuery } from "@tanstack/react-query";

export const TeacherDashboard = () => {
  const { startLoading, stopLoading } = useLoading();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-classroom"],
    queryFn: async () => {
      startLoading();
      const response = await axiosInstance.get(apiUrls.teacher.getMyClassroom);
      stopLoading();
      return response.data.classroom;
    },
  });

  return (
    <ClassroomsGrid data={[data]} isLoading={isLoading} isError={isError} />
  );
};
