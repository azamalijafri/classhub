import { useState } from "react";
import { apiUrls } from "../../constants/api-urls";
import { useModal } from "../../stores/modal-store";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogTitle } from "../ui/dialog";
import { ModalLayout } from "./modal-layout";
import ComboBox from "../inputs/combo-box";
import { useApi } from "@/hooks/useApiRequest";

const AssignTeacherModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type === "assign-teacher");
  const [selectedTeacher, setSelectedTeacher] = useState<string | undefined>(
    undefined
  );

  const {
    mutateData,
    isLoading,
    data: teachersData,
  } = useApi({ apiUrl: apiUrls.teacher.getAllTeachers });

  const handleAssign = async () => {
    await mutateData({
      url: apiUrls.classroom.assignTeacher,
      payload: {
        teacherId: selectedTeacher,
        classroomId: modal?.data?.classroomId,
      },
      method: "POST",
      queryKey: [modal?.data?.classroomId, "class-details"],
    });

    closeModal();
  };

  return (
    <ModalLayout isOpen={!!modal}>
      <DialogTitle className="text-bold text-xl">Assign Teacher</DialogTitle>
      <div className="flex flex-col gap-y-4 z-50">
        <ComboBox
          items={teachersData?.teachers?.map((teacher: ITeacher) => ({
            id: teacher._id,
            label: `${teacher.name} (${teacher.subject.name})`,
          }))}
          selectedValue={selectedTeacher}
          onSelect={(id) => setSelectedTeacher(id)}
          placeholder="Select a teacher"
        />
      </div>
      <DialogFooter>
        <Button
          onClick={handleAssign}
          disabled={!selectedTeacher || isLoading}
          isLoading={isLoading}
        >
          Assign
        </Button>
      </DialogFooter>
    </ModalLayout>
  );
};

export default AssignTeacherModal;
