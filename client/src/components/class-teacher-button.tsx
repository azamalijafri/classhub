import { useState } from "react";
import { Button } from "./ui/button";
import { useModal } from "@/stores/modal-store";

const ClassTeacherButton = ({ classroom }: { classroom: IClassroom }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const { openModal } = useModal();

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-32 flex items-center justify-center"
    >
      <div
        className={`absolute flex items-center justify-center font-medium transition-opacity duration-300 ease-in-out px-4 py-2 rounded-md border-[1px] border-primary w-full overflow-hidden text-ellipsis whitespace-nowrap ${
          isHovered ? "opacity-0" : "opacity-100"
        }`}
      >
        {classroom.mentor.name}
      </div>

      <Button
        onClick={() =>
          openModal("assign-teacher", { classroomId: classroom._id })
        }
        className={`absolute transition-opacity duration-300 ease-in-out ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        Assign Teacher
      </Button>
    </div>
  );
};

export default ClassTeacherButton;
