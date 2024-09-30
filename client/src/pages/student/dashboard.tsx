import ClassroomsGrid from "@/components/classroom/classrooms-grid";
import { apiUrls } from "@/constants/api-urls";
import { useApi } from "@/hooks/useApiRequest";

const StudentDashboard = () => {
  const { data, isLoading } = useApi({
    apiUrl: apiUrls.student.getMyClassrooms,
    queryKey: ["my-classroom"],
  });

  if (!isLoading && data.length == 0)
    return (
      <div className="h-[calc(100vh-5rem)] w-full flex items-center justify-center">
        <span className="font-medium">
          You haven't been assigned to a class yet
        </span>
      </div>
    );
  return <ClassroomsGrid data={data?.classrooms} isLoading={isLoading} />;
};

export default StudentDashboard;
