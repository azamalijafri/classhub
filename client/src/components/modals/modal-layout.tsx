import { ReactNode } from "react";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import { useModal } from "../../stores/modal-store";

export function ModalLayout({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: ReactNode;
}) {
  const { closeModal } = useModal();
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-[30rem]">{children}</DialogContent>
    </Dialog>
  );
}
