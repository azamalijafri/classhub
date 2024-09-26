import StudentsList from "@/components/students/all-students-list";
import { useEffect } from "react";

const Students = () => {
  useEffect(() => {
    document.title = "Students | CloudCampus";
  }, []);

  return (
    <div>
      <StudentsList queryKey="all" />
    </div>
  );
};

export default Students;
