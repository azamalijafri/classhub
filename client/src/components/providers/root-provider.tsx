import { ReactNode } from "react";
import ModalProvider from "./modal-provider";

const RootProvider = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <ModalProvider />
      {children}
    </div>
  );
};

export default RootProvider;
