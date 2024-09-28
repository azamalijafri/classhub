import { useFetchData } from "@/hooks/useFetchData";
import DataTable from "@/components/table/data-table";
import { apiUrls } from "@/constants/api-urls";
import { Button } from "@/components/ui/button";
import { useModal } from "@/stores/modal-store";
import axiosInstance from "@/lib/axios-instance";
import queryString from "query-string";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { scrollToTop } from "@/lib/utils";

type Teacher = ITeacher & { classroom: IClassroom };

const AllTeachersList = ({ queryKey }: { queryKey: string }) => {
  const location = useLocation();

  const {
    search,
    class: classFilter,
    subject,
    page = 1,
    sf,
    so,
  } = Object.fromEntries(new URLSearchParams(location.search).entries());

  const apiUrl = queryString.stringifyUrl(
    {
      url: apiUrls.teacher.getAllTeachers,
      query: {
        search,
        class: classFilter,
        page,
        subject,
        sf,
        so,
      },
    },
    { skipEmptyString: true, skipNull: true }
  );

  const { data = [], refetch } = useFetchData({
    queryKey: [queryKey, "teachers"],
    apiUrl,
  });

  useEffect(() => {
    refetch().then(() => scrollToTop());
  }, [search, classFilter, page, sf, so, apiUrl, subject, refetch]);

  const { openModal } = useModal();

  const columns = [
    {
      label: "Name",
      render: (teacher: Teacher) => teacher.name,
      value: "name",
      colspan: 2,
    },
    {
      label: "Email",
      render: (teacher: Teacher) => teacher.user.email,
      value: "email",
      colspan: 2,
    },
    {
      label: "Subject",
      render: (teacher: Teacher) => teacher.subject.name,
      value: "subject",
      colspan: 2,
    },
    {
      label: "Class",
      render: (teacher: Teacher) => teacher.classroom?.name ?? "Not Assigned",
      value: "classroom",
      colspan: 2,
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
                `${apiUrls.teacher.removeTeacherFromSchool}/${teacher._id}`
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
      <h3 className="font-medium text-xl underline underline-offset-4">
        All Teachers
      </h3>
      <DataTable
        gridValue="10"
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

export default AllTeachersList;
