import ClassroomsGrid from "@/components/classroom/classrooms-grid";
import { apiUrls } from "@/constants/api-urls";
import axiosInstance from "@/lib/axios-instance";
import { useLoading } from "@/stores/loader-store";
import { useQuery } from "@tanstack/react-query";

export const StudentDashboard = () => {
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

  if (!isLoading && data.length == 0)
    return (
      <div className="h-[calc(100vh-5rem)] w-full flex items-center justify-center">
        <span className="font-medium">
          You haven't been assigned to a class yet
        </span>
      </div>
    );
  return <ClassroomsGrid data={data} isLoading={isLoading} isError={isError} />;
};
