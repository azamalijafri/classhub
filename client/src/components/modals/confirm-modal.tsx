import { useState } from "react";
import { useModal } from "../../stores/modal-store";
import { Button } from "../ui/button";
import { DialogDescription, DialogFooter } from "../ui/dialog";
import { ModalLayout } from "./modal-layout";

const ConfirmModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type == "confirm");
  const performingAction = modal?.data?.performingAction;
  const [loading, setLoading] = useState(false);

  return (
    <ModalLayout isOpen={!!modal}>
      <DialogDescription className="text-lg font-medium text-primary mt-4 mx-auto">
        Are you sure you want to do this?
      </DialogDescription>
      <DialogFooter className="mx-auto flex gap-x-4">
        <Button
          isLoading={loading}
          disabled={loading}
          onClick={() => {
            setLoading(true);
            performingAction!();
            closeModal();
            setLoading(false);
          }}
        >
          Confirm
        </Button>
        <Button variant={"outline"} onClick={closeModal}>
          Cancel
        </Button>
      </DialogFooter>
    </ModalLayout>
  );
};

export default ConfirmModal;
