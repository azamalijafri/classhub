import CreateClassroomModal from "../modals/upsert-classroom-modal";
import ConfirmModal from "../modals/confirm-modal";
import { useModal } from "../../stores/modal-store";
import CreateTeacherModal from "../modals/upsert-teacher-modal";
import AssignTeacherModal from "../modals/assign-teacher-modal";
import TimetableModal from "../modals/timetable-modal";
import CreateStudentModal from "../modals/upsert-student-modal";
import AssignStudentModal from "../modals/assign-student-modal";
import CreateSubjectsModal from "../modals/create-subject-modal";
import AttendanceModal from "../modals/attendance-modal";

const ModalProvider = () => {
  const { modals } = useModal();

  return (
    <>
      {modals.map((modal, index) => {
        switch (modal.type) {
          case "upsert-classroom":
            return <CreateClassroomModal key={index} />;
          case "upsert-teacher":
            return <CreateTeacherModal key={index} />;
          case "upsert-student":
            return <CreateStudentModal key={index} />;
          case "confirm":
            return <ConfirmModal key={index} />;
          case "assign-teacher":
            return <AssignTeacherModal key={index} />;
          case "edit-timetable":
            return <TimetableModal key={index} />;
          case "assign-students":
            return <AssignStudentModal key={index} />;
          case "create-subject":
            return <CreateSubjectsModal key={index} />;
          case "attendance":
            return <AttendanceModal key={index} />;
        }
      })}
    </>
  );
};

export default ModalProvider;
