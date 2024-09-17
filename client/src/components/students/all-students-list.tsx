import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useFetchData } from "@/hooks/useFetchData";
import DataTable from "@/components/data-table";
import { apiUrls } from "@/constants/api-urls";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useModal } from "@/stores/modal-store";
import axiosInstance from "@/lib/axios-instance";
import queryString from "query-string";

const AllStudentsList = ({ queryKey }: { queryKey: string }) => {
  const location = useLocation();

  const {
    search,
    class: classFilter,
    page = 1,
  } = Object.fromEntries(new URLSearchParams(location.search).entries());

  const apiUrl = queryString.stringifyUrl(
    {
      url: apiUrls.student.getAllStudents,
      query: { search, class: classFilter, page },
    },
    { skipEmptyString: true, skipNull: true }
  );

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const { data = [], refetch } = useFetchData(
    [queryKey, "students", search, classFilter, page.toString()],
    apiUrl
  );
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
      <Button
        variant="default"
        onClick={() => {
          openModal("upsert-student", { student: student });
        }}
      >
        Edit
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          openModal("confirm", {
            performingAction: async () => {
              const response = await axiosInstance.put(
                `${apiUrls.student.removeStudent}/${student._id}`
              );

              if (response) refetch();
            },
          });
        }}
      >
        Remove
      </Button>
    </div>
  );

  return (
    <div className="p-4 flex flex-col space-y-4">
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

      <DataTable
        data={data?.students}
        columns={columns}
        actions={actions}
        totalItems={data?.totalStudents}
        classFilter={true}
      />
    </div>
  );
};

export default AllStudentsList;
