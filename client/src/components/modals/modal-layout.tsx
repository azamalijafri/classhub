import { ReactNode } from "react";
import { Dialog, DialogContent } from "../../components/ui/dialog";

export function ModalLayout({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[30rem]">{children}</DialogContent>
    </Dialog>
  );
}
