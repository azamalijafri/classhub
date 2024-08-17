import CreateClassroomModal from "../modals/create-classroom-modal";
import ConfirmModal from "../modals/confirm-modal";
import { useModal } from "../../stores/modal-store";
import CreateTeacherModal from "../modals/create-teacher-modal";
import AssignTeacherModal from "../modals/assign-teacher-modal";

const ModalProvider = () => {
  const { modals } = useModal();

  return (
    <>
      {modals.map((modal, index) => {
        switch (modal.type) {
          case "create-classroom":
            return <CreateClassroomModal key={index} />;
          case "create-teacher":
            return <CreateTeacherModal key={index} />;
          case "confirm":
            return <ConfirmModal />;
          case "assign-teacher":
            return <AssignTeacherModal />;
        }
      })}
    </>
  );
};

export default ModalProvider;
