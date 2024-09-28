import { useLocation, useParams } from "react-router-dom";
import { useFetchData } from "@/hooks/useFetchData";
import DataTable from "@/components/table/data-table";
import { apiUrls } from "@/constants/api-urls";
import { Button } from "@/components/ui/button";
import { useModal } from "@/stores/modal-store";
import axiosInstance from "@/lib/axios-instance";
import queryString from "query-string";
import { useEffect } from "react";
import { scrollToTop } from "@/lib/utils";

const ClassStudentsList = () => {
  const location = useLocation();
  const { classroomId } = useParams();

  const {
    search,
    page = 1,
    sf,
    so,
  } = Object.fromEntries(new URLSearchParams(location.search).entries());

  const apiUrl = queryString.stringifyUrl(
    {
      url: `${apiUrls.classroom.getClassStudents}/${classroomId}`,
      query: { search, page, so, sf },
    },
    { skipEmptyString: true, skipNull: true }
  );

  const { data = [], refetch } = useFetchData({
    queryKey: [classroomId, "class-students"],
    apiUrl,
  });

  useEffect(() => {
    refetch().then(() => scrollToTop());
  }, [search, page, sf, so, refetch]);

  const { openModal } = useModal();

  const columns = [
    {
      label: "Name",
      render: (student: IStudent) => student.name,
      value: "name",
      colspan: 3,
    },
    {
      label: "Email",
      render: (student: IStudent) => student.user.email,
      value: "email",
      colspan: 3,
    },
    {
      label: "Roll No",
      render: (student: IStudent) => student.roll,
      value: "roll",
      colspan: 3,
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
                `${apiUrls.student.kickStudentFromClass}/${student._id}`
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
        gridValue="10"
        data={data.students}
        columns={columns}
        actions={actions}
        totalItems={data.totalStudents}
      />
    </div>
  );
};

export default ClassStudentsList;
