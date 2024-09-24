import { useEffect, useState } from "react";
import { apiUrls } from "../../constants/api-urls";
import axiosInstance from "../../lib/axios-instance";
import { useModal } from "../../stores/modal-store";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogTitle } from "../ui/dialog";
import { ModalLayout } from "./modal-layout";
import { useRefetchQuery } from "@/hooks/useRefetchQuery";
import ComboBox from "../inputs/combo-box";

const AssignTeacherModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type === "assign-teacher");
  const [teachers, setTeachers] = useState<ITeacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | undefined>(
    undefined
  );

  const refetchQuery = useRefetchQuery();

  const fetchTeachers = async () => {
    const response = await axiosInstance.get(apiUrls.teacher.getAllTeachers);

    setTeachers(response.data.teachers);
  };

  useEffect(() => {
    if (modal) {
      fetchTeachers();
    }
  }, [modal]);

  const handleAssign = async () => {
    if (!selectedTeacher) return;

    try {
      await axiosInstance.post(apiUrls.classroom.assignTeacher, {
        teacherId: selectedTeacher,
        classroomId: modal?.data?.classId,
      });
      refetchQuery([modal?.data?.classId, "class-details"]);
      closeModal();
    } catch (error) {
      console.error("Failed to assign teacher", error);
    }
  };

  return (
    <ModalLayout isOpen={!!modal}>
      <DialogTitle className="text-bold text-xl">Assign Teacher</DialogTitle>
      <div className="flex flex-col gap-y-4 z-50 mb-80">
        <ComboBox
          items={teachers.map((teacher) => ({
            id: teacher._id,
            label: `${teacher.name} (${teacher.subject.name})`,
          }))}
          selectedValue={selectedTeacher}
          onSelect={(id) => setSelectedTeacher(id)}
          placeholder="Select a teacher"
        />
      </div>
      <DialogFooter>
        <Button onClick={handleAssign} disabled={!selectedTeacher}>
          Assign
        </Button>
      </DialogFooter>
    </ModalLayout>
  );
};

export default AssignTeacherModal;
