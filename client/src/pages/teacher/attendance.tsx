import ClassroomsGrid from "@/components/classroom/classrooms-grid";
import { apiUrls } from "@/constants/api-urls";
import { useFetchData } from "@/hooks/useFetchData";

const Attendance = () => {
  const { data, isLoading } = useFetchData({
    queryKey: ["attendance-classes"],
    apiUrl: apiUrls.teacher.getMyAttendanceClasses,
  });

  return <ClassroomsGrid data={data?.classrooms} isLoading={isLoading} />;
};

export default Attendance;
