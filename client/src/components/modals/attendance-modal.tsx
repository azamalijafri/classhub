import { useState, useEffect } from "react";
import { apiUrls } from "../../constants/api-urls";
import { useModal } from "../../stores/modal-store";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogTitle } from "../ui/dialog";
import { ModalLayout } from "./modal-layout";
import { Checkbox } from "../ui/checkbox";
import { useFetchData } from "@/hooks/useFetchData";
import { Loader2Icon } from "lucide-react";
import axiosInstance from "@/lib/axios-instance";
import { useRefetchQuery } from "@/hooks/useRefetchQuery";

const AttendanceModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type === "attendance");

  const [attendance, setAttendance] = useState<Record<string, number>>({});

  const { data, isLoading } = useFetchData(
    [],
    `${apiUrls.classroom.getClassStudents}/${modal?.data?.classId}?pageLimit=all`
  );

  const refetchQuery = useRefetchQuery();

  useEffect(() => {
    if (data?.students) {
      const initialAttendance: Record<string, number> = {};
      data.students.forEach((student: IStudent) => {
        initialAttendance[student._id] = 0;
      });
      setAttendance(initialAttendance);
    }
  }, [data]);

  const handleCheckboxChange = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 1 ? 0 : 1,
    }));
  };

  const handleSubmitAttendance = async () => {
    try {
      const response = await axiosInstance.post(
        apiUrls.attendance.markAttendance,
        {
          classroomId: modal?.data?.classId,
          subjectId: modal?.data?.subjectId,
          teacherId: modal?.data?.teacherId,
          periodId: modal?.data?.periodId,
          date: new Date(),
          students: Object.keys(attendance).map((studentId) => ({
            studentId,
            status: attendance[studentId].toString(),
          })),
        }
      );

      if (response) {
        refetchQuery(["teacher-schedule", modal?.data?.teacherId]);
        closeModal();
      }
    } catch (error) {
      console.error("Failed to mark attendance", error);
    }
  };

  return (
    <ModalLayout isOpen={!!modal}>
      <DialogTitle className="text-bold text-xl">Mark Attendance</DialogTitle>
      <div>
        {isLoading ? (
          <div className="size-full flex items-center justify-center">
            <Loader2Icon className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-y-4 max-h-[70vh] overflow-auto">
            {data?.students?.map((student: IStudent) => (
              <div key={student._id} className="flex items-center gap-x-2">
                <Checkbox
                  checked={attendance[student._id] === 1}
                  onClick={() => handleCheckboxChange(student._id)}
                />
                <span>{student.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          onClick={handleSubmitAttendance}
          disabled={!Object.keys(attendance).length}
        >
          Submit Attendance
        </Button>
      </DialogFooter>
    </ModalLayout>
  );
};

export default AttendanceModal;
