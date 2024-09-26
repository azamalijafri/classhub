import AllTeachersList from "@/components/teachers/all-teachers-list";
import { useEffect } from "react";

const Teachers = () => {
  useEffect(() => {
    document.title = "Teachers | CloudCampus";
  }, []);

  return (
    <div>
      <AllTeachersList queryKey="all" />
    </div>
  );
};

export default Teachers;
