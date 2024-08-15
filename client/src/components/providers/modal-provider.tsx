import { ReactNode } from "react";
import CreateClassroomModal from "../modals/create-classroom";

const ModalProvider = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <CreateClassroomModal />
      {children}
    </div>
  );
};

export default ModalProvider;
