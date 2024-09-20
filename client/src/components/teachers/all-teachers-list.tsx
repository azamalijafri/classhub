import { useFetchData } from "@/hooks/useFetchData";
import DataTable from "@/components/data-table";
import { apiUrls } from "@/constants/api-urls";
import { Button } from "@/components/ui/button";
import { useModal } from "@/stores/modal-store";
import axiosInstance from "@/lib/axios-instance";
import queryString from "query-string";
import { useLocation } from "react-router-dom";

type Teacher = ITeacher & { classroom: IClassroom };

const TeachersList = ({ queryKey }: { queryKey: string }) => {
  const location = useLocation();

  const {
    search,
    class: classFilter,
    subject,
    page = 1,
    sortField,
    sortOrder,
  } = Object.fromEntries(new URLSearchParams(location.search).entries());

  const apiUrl = queryString.stringifyUrl(
    {
      url: apiUrls.teacher.getAllTeachers,
      query: {
        search,
        class: classFilter,
        page,
        subject,
        sortField,
        sortOrder,
      },
    },
    { skipEmptyString: true, skipNull: true }
  );

  const { data = [], refetch } = useFetchData(
    [
      queryKey,
      "teachers",
      search,
      classFilter,
      subject,
      page.toString(),
      sortField,
      sortOrder,
    ],
    apiUrl
  );
  const { openModal } = useModal();

  const columns = [
    {
      label: "Name",
      render: (teacher: Teacher) => teacher.name,
      value: "name",
    },
    {
      label: "Email",
      render: (teacher: Teacher) => teacher.user.email,
      value: "email",
    },
    {
      label: "Subject",
      render: (teacher: Teacher) => teacher.subject.name,
      value: "subject",
    },
    {
      label: "Class",
      render: (teacher: Teacher) => teacher.classroom?.name ?? "N/A",
      value: "classroom",
    },
  ];

  const actions = (teacher: Teacher) => (
    <div className="flex space-x-2">
      <Button
        variant="default"
        onClick={() => {
          openModal("upsert-teacher", { teacher });
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
                `${apiUrls.teacher.removeTeacher}/${teacher._id}`
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
      <h3 className="font-normal text-2xl">All Teachers</h3>
      <DataTable
        data={data.teachers}
        columns={columns}
        actions={actions}
        classFilter={true}
        subjectFilter={true}
        totalItems={data.totalTeachers}
      />
    </div>
  );
};

export default TeachersList;
