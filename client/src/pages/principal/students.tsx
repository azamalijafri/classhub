import StudentsList from "@/components/students/all-students-list";

const Students = () => {
  return (
    <div>
      <StudentsList queryKey="all" />
    </div>
  );
};

export default Students;
