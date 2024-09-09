import { apiUrls } from "@/constants/api-urls";
import axiosInstance from "@/lib/axios-instance";
import { useSidebar } from "@/stores/sidebar-store";
import ClassroomCard from "./classroom-card";
import { useQuery } from "@tanstack/react-query";
import { useLoading } from "@/stores/loader-store";

export const ClassroomsGrid = () => {
  const { isCollapsed } = useSidebar();
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

  if (isLoading) {
    return null;
  }

  if (isError) {
    return <div>Failed to load classrooms. Please try again later.</div>;
  }

  const classrooms: IClassroom[] = data || [];

  return (
    <div
      className={`grid gap-x-4 gap-y-2 ${
        isCollapsed ? "grid-cols-5" : "grid-cols-4"
      } p-4`}
    >
      {classrooms.map((classroom: IClassroom) => (
        <ClassroomCard key={classroom._id} classroom={classroom} />
      ))}
    </div>
  );
};
