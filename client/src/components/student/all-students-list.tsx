/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFetchData } from "@/hooks/useFetchData";
import DataTable from "@/components/table/data-table";
import { apiUrls } from "@/constants/api-urls";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useModal } from "@/stores/modal-store";
import axiosInstance from "@/lib/axios-instance";
import queryString from "query-string";
import { scrollToTop } from "@/lib/utils";

const AllStudentsList = ({ queryKey }: { queryKey: string }) => {
  const location = useLocation();

  const {
    search,
    class: classFilter,
    page = 1,
    sf,
    so,
  } = Object.fromEntries(new URLSearchParams(location.search).entries());

  const apiUrl = queryString.stringifyUrl(
    {
      url: apiUrls.student.getAllStudents,
      query: {
        search,
        class: classFilter,
        page,
        sf,
        so,
      },
    },
    { skipEmptyString: true, skipNull: true }
  );

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const { data = [], refetch } = useFetchData({
    queryKey: [queryKey, "students"],
    apiUrl,
  });

  useEffect(() => {
    refetch().then(() => scrollToTop());
  }, [search, classFilter, page, sf, so, apiUrl, refetch]);

  const { openModal } = useModal();

  const toggleSelectStudent = (studentId: string) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(studentId)
        ? prevSelected.filter((id) => id !== studentId)
        : [...prevSelected, studentId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedStudents.length === data?.students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(data?.students.map((student: any) => student._id));
    }
  };

  const handleAssign = () => {
    openModal("assign-students", { selectedStudents });
  };

  const columns = [
    {
      label: "Select",
      render: (student: IStudent & { classrooms: IClassroom[] }) => (
        <Checkbox
          checked={selectedStudents.includes(student._id)}
          onClick={() => toggleSelectStudent(student._id)}
        />
      ),
      value: "select",
      colspan: 0,
    },
    {
      label: "Name",
      render: (student: IStudent) => student?.name,
      value: "name",
      colspan: 2,
    },
    {
      label: "Email",
      render: (student: IStudent) => student?.user?.email,
      value: "email",
      colspan: 2,
    },
    {
      label: "Class",
      render: (student: IStudent & { classrooms: IClassroom[] }) => {
        if (student?.classrooms?.length > 0) {
          return student?.classrooms?.length > 1
            ? `Assigned to ${student?.classrooms?.length} classes`
            : student?.classrooms[0].name;
        } else {
          return "Not Assigned";
        }
      },
      value: "classroom",
      colspan: 2,
    },
    {
      label: "Roll No",
      render: (student: IStudent) => student?.roll,
      value: "roll",
      colspan: 1,
    },
  ];

  const actions = (student: IStudent) => (
    <div className="flex space-x-2">
      <Button
        variant="default"
        onClick={() => {
          openModal("upsert-student", { student });
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
                `${apiUrls.student.removeStudentFromSchool}/${student._id}`
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
        <h3 className="font-medium text-xl underline underline-offset-4">
          All Students
        </h3>
        <div className="flex justify-between items-center mb-2 gap-x-3">
          <Button onClick={handleToggleSelectAll}>
            {selectedStudents?.length === data?.students?.length
              ? "Deselect All"
              : "Select All"}
          </Button>
          <Button
            variant="default"
            onClick={handleAssign}
            disabled={selectedStudents.length === 0}
          >
            Assign Class
          </Button>
        </div>
      </div>

      <DataTable
        gridValue="10"
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
