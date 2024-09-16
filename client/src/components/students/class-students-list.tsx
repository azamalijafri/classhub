import { useParams } from "react-router-dom";
import { useFetchData } from "@/hooks/useFetchData";
import DataTable from "@/components/data-table";
import { apiUrls } from "@/constants/api-urls";
import { Button } from "@/components/ui/button";
import { useModal } from "@/stores/modal-store";
import axiosInstance from "@/lib/axios-instance";

const ClassStudentsList = ({ queryKey }: { queryKey: string }) => {
  const { classId } = useParams();
  const { data = [], refetch } = useFetchData(
    [queryKey, "classStudents"],
    `${apiUrls.student.getClassStudents}/${classId}`
  );
  const { openModal } = useModal();

  const columns = [
    { label: "Name", render: (student: IStudent) => student.name },
    { label: "Email", render: (student: IStudent) => student.user.email },
    { label: "Roll No", render: (student: IStudent) => student.rollNo },
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
      <DataTable data={data.students} columns={columns} actions={actions} />
    </div>
  );
};

export default ClassStudentsList;
