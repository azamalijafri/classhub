import { ClassroomsGrid } from "@/components/classrooms-grid";
import { apiUrls } from "@/constants/api-urls";
import axiosInstance from "@/lib/axios-instance";
import { useLoading } from "@/stores/loader-store";
import { useQuery } from "@tanstack/react-query";

export const PrincipalDashboard = () => {
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

  return <ClassroomsGrid data={data} isLoading={isLoading} isError={isError} />;
};
