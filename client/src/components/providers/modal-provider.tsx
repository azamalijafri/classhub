import CreateClassroomModal from "../modals/upsert-classroom-modal";
import ConfirmModal from "../modals/confirm-modal";
import { useModal } from "../../stores/modal-store";
import CreateTeacherModal from "../modals/create-teacher-modal";
import AssignTeacherModal from "../modals/assign-teacher-modal";
import TimetableModal from "../modals/timetable-modal";

const ModalProvider = () => {
  const { modals } = useModal();

  return (
    <>
      {modals.map((modal, index) => {
        switch (modal.type) {
          case "upsert-classroom":
            return <CreateClassroomModal key={index} />;
          case "create-teacher":
            return <CreateTeacherModal key={index} />;
          case "confirm":
            return <ConfirmModal key={index} />;
          case "assign-teacher":
            return <AssignTeacherModal key={index} />;
          case "edit-timetable":
            return <TimetableModal key={index} />;
        }
      })}
    </>
  );
};

export default ModalProvider;
