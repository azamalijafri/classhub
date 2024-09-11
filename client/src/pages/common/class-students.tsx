import ClassStudentsList from "@/components/students/class-students-list";

const ClassStudents = () => {
  return (
    <div>
      <ClassStudentsList queryKey="class" />
    </div>
  );
};

export default ClassStudents;
