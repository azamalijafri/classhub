import { ReactNode } from "react";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import { useModal } from "../../stores/modal-store";

export function ModalLayout({
  isOpen,
  children,
  maxWidth,
}: {
  isOpen: boolean;
  children: ReactNode;
  maxWidth?: boolean;
}) {
  const { closeModal } = useModal();
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className={`min-w-fit ${maxWidth && "max-w-3xl"} `}>
        {children}
      </DialogContent>
    </Dialog>
  );
}
