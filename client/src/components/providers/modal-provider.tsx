import { ReactNode } from "react";

const ModalProvider = ({ children }: { children: ReactNode }) => {
  return <div>{children}</div>;
};

export default ModalProvider;
