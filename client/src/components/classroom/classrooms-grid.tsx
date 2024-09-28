import { useSidebar } from "@/stores/sidebar-store";
import ClassroomCard from "./classroom-card";

const ClassroomsGrid = ({
  isLoading,
  isError,
  data,
}: {
  isLoading: boolean;
  isError: boolean;
  data: IClassroom[];
}) => {
  const { isCollapsed } = useSidebar();

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
      {classrooms.map((classroom: IClassroom, index: number) => (
        <ClassroomCard key={index} classroom={classroom} />
      ))}
    </div>
  );
};

export default ClassroomsGrid;
