import { useLocation, useParams } from "react-router-dom";
import { useFetchData } from "@/hooks/useFetchData";
import DataTable from "@/components/data-table";
import { apiUrls } from "@/constants/api-urls";
import { Button } from "@/components/ui/button";
import { useModal } from "@/stores/modal-store";
import axiosInstance from "@/lib/axios-instance";
import queryString from "query-string";

const ClassStudentsList = ({ queryKey }: { queryKey: string }) => {
  const location = useLocation();
  const { classId } = useParams();

  const {
    search,
    page = 1,
    sortField,
    sortOrder,
  } = Object.fromEntries(new URLSearchParams(location.search).entries());

  const apiUrl = queryString.stringifyUrl(
    {
      url: `${apiUrls.student.getClassStudents}/${classId}`,
      query: { search, page, sortOrder, sortField },
    },
    { skipEmptyString: true, skipNull: true }
  );

  const { data = [], refetch } = useFetchData(
    [queryKey, "classStudents", search, page.toString(), sortField, sortOrder],
    apiUrl
  );
  const { openModal } = useModal();

  const columns = [
    {
      label: "Name",
      render: (student: IStudent) => student.name,
      value: "name",
    },
    {
      label: "Email",
      render: (student: IStudent) => student.user.email,
      value: "email",
    },
    {
      label: "Roll No",
      render: (student: IStudent) => student.rollNo,
      value: "rollNo",
    },
  ];

  const actions = (student: IStudent) => (
    <div className="flex space-x-2">
      <Button
        variant="destructive"
        onClick={() =>
          openModal("confirm", {
            performingAction: async () => {
              const response = await axiosInstance.put(
                `${apiUrls.student.kickStudent}/${student._id}`
              );
              if (response) {
                refetch();
              }
            },
          })
        }
      >
        Kick
      </Button>
    </div>
  );

  return (
    <div className="p-4 ">
      <DataTable
        data={data.students}
        columns={columns}
        actions={actions}
        totalItems={data.totalStudents}
      />
    </div>
  );
};

export default ClassStudentsList;
