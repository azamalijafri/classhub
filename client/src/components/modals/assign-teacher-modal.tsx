import { useEffect, useState } from "react";
import { apiUrls } from "../../constants/api-urls";
import axiosInstance from "../../lib/axios-instance";
import { useModal } from "../../stores/modal-store";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogTitle } from "../ui/dialog";
import { ModalLayout } from "./modal-layout";
import { Checkbox } from "../ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AssignTeacherModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type === "assign-teacher");
  const [teachers, setTeachers] = useState<IProfile[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

  const fetchTeachers = async () => {
    const response = await axiosInstance.get(apiUrls.teacher.getAllTeachers);
    setTeachers(response.data.teachers);
  };

  useEffect(() => {
    if (modal) {
      fetchTeachers();
    }
  }, [modal]);

  const handleCheckboxChange = (teacherId: string) => {
    setSelectedTeacher((prev) => (prev === teacherId ? null : teacherId));
  };

  const handleAssign = async () => {
    if (!selectedTeacher) return;

    try {
      await axiosInstance.post(apiUrls.classroom.assignTeacher, {
        teacherId: selectedTeacher,
        classroomId: modal?.data?.classId,
      });
      closeModal();
    } catch (error) {
      console.error("Failed to assign teacher", error);
    }
  };

  return (
    <ModalLayout isOpen={!!modal}>
      <DialogTitle className="text-bold text-xl">Assign Teacher</DialogTitle>
      <div className="flex flex-col gap-y-4">
        {teachers.map((teacher) => (
          <div key={teacher._id} className="flex items-center gap-x-2">
            <Checkbox
              checked={selectedTeacher === teacher._id}
              onClick={() => handleCheckboxChange(teacher._id)}
            />
            <label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-base font-medium">
                      {teacher.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{teacher.user.email}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
          </div>
        ))}
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
