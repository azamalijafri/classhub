import ClassroomsGrid from "@/components/classroom/classrooms-grid";
import { apiUrls } from "@/constants/api-urls";
import { useApi } from "@/hooks/useApiRequest";
import { useEffect } from "react";

const TeacherDashboard = () => {
  const { data, isLoading } = useApi({
    apiUrl: apiUrls.teacher.getMyClassroom,
    queryKey: ["my-classroom"],
  });

  useEffect(() => {
    document.title = "Dashboard | CloudCampus";
  }, []);

  if (!isLoading && data?.length == 0)
    return (
      <div className="h-[calc(100vh-5rem)] w-full flex items-center justify-center">
        <span className="font-medium">
          You haven't been assigned to a class yet
        </span>
      </div>
    );
  return <ClassroomsGrid data={[data?.classroom]} isLoading={isLoading} />;
};

export default TeacherDashboard;
