import { useState } from "react";
import { useFetchData } from "@/hooks/useFetchData";
import DataTable from "@/components/data-table";
import { apiUrls } from "@/constants/api-urls";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useModal } from "@/stores/modal-store";

const AllStudentsList = ({ queryKey }: { queryKey: string }) => {
  const { data = [] } = useFetchData(
    [queryKey, "students"],
    apiUrls.student.getAllStudents
  );
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const { openModal } = useModal();

  const toggleSelectStudent = (studentId: string) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(studentId)
        ? prevSelected.filter((id) => id !== studentId)
        : [...prevSelected, studentId]
    );
  };

  const handleAssign = () => {
    openModal("assign-students", { selectedStudents });
  };

  const columns = [
    {
      label: "Select",
      render: (student: IStudent) => (
        <Checkbox
          checked={selectedStudents.includes(student._id)}
          onClick={() => toggleSelectStudent(student._id)}
        />
      ),
    },
    { label: "Name", render: (student: IStudent) => student.name },
    { label: "Email", render: (student: IStudent) => student.user.email },
    {
      label: "Class",
      render: (student: IStudent) => student.classroom?.name ?? "N/A",
    },
    { label: "Roll No", render: (student: IStudent) => student.rollNo },
  ];

  const actions = (student: IStudent) => (
    <div className="flex space-x-2">
      <Button variant="default" onClick={() => console.log("Edit", student)}>
        Edit
      </Button>
      <Button
        variant="destructive"
        onClick={() => console.log("Block", student)}
      >
        Block
      </Button>
    </div>
  );

  return (
    <div className="p-4 flex flex-col space-y-4">
      {/* Assign button at the top */}
      <div className="flex justify-between items-center">
        <h3 className="font-normal text-2xl">All Students</h3>
        <Button
          variant="default"
          onClick={handleAssign}
          disabled={selectedStudents.length === 0}
        >
          Assign Class
        </Button>
      </div>

      {data?.students?.length === 0 ? (
        <p className="mx-auto">No students found.</p>
      ) : (
        <DataTable data={data?.students} columns={columns} actions={actions} />
      )}
    </div>
  );
};

export default AllStudentsList;
