import ClassroomsGrid from "@/components/classroom/classrooms-grid";
import { apiUrls } from "@/constants/api-urls";
import { useApi } from "@/hooks/useApiRequest";
import { useEffect } from "react";

const PrincipalDashboard = () => {
  const {
    fetchedData: data,
    isLoading,
    error,
  } = useApi({
    apiUrl: apiUrls.classroom.getAllClassrooms,
    queryKey: ["all-classrooms"],
  });

  useEffect(() => {
    document.title = "Dashboard | CloudCampus";
  }, []);

  if (!isLoading && data?.classrooms?.length == 0)
    return (
      <div className="h-[calc(100vh-5rem)] w-full flex items-center justify-center">
        <span className="font-medium">You haven't created a class yet</span>
      </div>
    );
  return (
    <ClassroomsGrid
      data={data?.classrooms}
      isLoading={isLoading}
      isError={!!error}
    />
  );
};

export default PrincipalDashboard;
