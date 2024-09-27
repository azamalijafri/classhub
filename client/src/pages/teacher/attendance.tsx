import { ClassroomsGrid } from "@/components/classrooms-grid";
import { apiUrls } from "@/constants/api-urls";
import { useFetchData } from "@/hooks/useFetchData";

const Attendance = () => {
  const { data, isLoading, isError } = useFetchData({
    queryKey: ["attendance-classes"],
    apiUrl: apiUrls.teacher.getMyAttendanceClasses,
  });

  return (
    <ClassroomsGrid
      data={data?.classrooms}
      isLoading={isLoading}
      isError={isError}
    />
  );
};

export default Attendance;
