import { useSidebar } from "@/stores/sidebar-store";
import ClassroomCard from "./classroom-card";

const ClassroomsGrid = ({
  data,
}: {
  isLoading: boolean;
  data: IClassroom[];
}) => {
  const { isCollapsed } = useSidebar();

  const classrooms: IClassroom[] = data || [];

  return (
    <div
      className={`grid gap-x-4 gap-y-2 ${
        isCollapsed ? "grid-cols-5" : "grid-cols-4"
      } p-4`}
    >
      {classrooms?.map((classroom: IClassroom, index: number) => (
        <ClassroomCard key={index} classroom={classroom} />
      ))}
    </div>
  );
};

export default ClassroomsGrid;
