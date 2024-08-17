import { useModal } from "../../stores/modal-store";
import { Button } from "../ui/button";
import { DialogDescription, DialogFooter } from "../ui/dialog";
import { ModalLayout } from "./modal-layout";

const ConfirmModal = () => {
  const { modals } = useModal();
  const modal = modals.find((modal) => modal.type == "confirm");

  return (
    <ModalLayout isOpen={!!modal}>
      <DialogDescription className="text-lg font-medium text-primary mt-4">
        Are you sure you want to perform this action?
      </DialogDescription>
      <DialogFooter className="mx-auto flex gap-x-4">
        <Button>Confirm</Button>
        <Button variant={"outline"}>Cancel</Button>
      </DialogFooter>
    </ModalLayout>
  );
};

export default ConfirmModal;
