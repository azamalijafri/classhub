import { ReactNode } from "react";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import { useModal } from "../../stores/modal-store";

export function ModalLayout({
  isOpen,
  children,
  maxWidth,
  customHeight,
}: {
  isOpen: boolean;
  children: ReactNode;
  maxWidth?: string;
  customHeight?: string;
}) {
  const { closeModal } = useModal();
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        className={`min-w-fit ${customHeight} ${
          maxWidth && maxWidth
        } max-h-[90vh] overflow-auto`}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
