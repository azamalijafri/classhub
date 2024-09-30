import { useState } from "react";
import { apiUrls } from "../../constants/api-urls";
import { useModal } from "../../stores/modal-store";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogTitle } from "../ui/dialog";
import { ModalLayout } from "./modal-layout";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useApi } from "@/hooks/useApiRequest";

const AssignStudentModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type === "assign-students");
  const selectedStudents = modal?.data?.selectedStudents;
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { mutateData, isLoading, data } = useApi({
    apiUrl: apiUrls.classroom.getAllClassrooms,
  });

  const handleAssign = async () => {
    await mutateData({
      url: apiUrls.classroom.assignStudents,
      payload: { studentsIds: selectedStudents, classroomId: selectedClass },
      method: "POST",
      queryKey: ["all-students"],
    });

    closeModal();
  };

  return (
    <ModalLayout isOpen={!!modal}>
      <DialogTitle className="text-bold text-xl">Assign Students</DialogTitle>
      <div className="flex flex-col gap-y-4 w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-controls="classroom-list"
              className="justify-between"
            >
              {selectedClass
                ? data?.classrooms.find(
                    (classroom: IClassroom) => classroom._id === selectedClass
                  )?.name
                : "Select a classroom"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Command>
              <CommandInput placeholder="Search classroom..." />
              <CommandList id="classroom-list">
                <CommandEmpty>No classroom found.</CommandEmpty>
                <CommandGroup>
                  {data?.classrooms.map((classroom: IClassroom) => (
                    <CommandItem
                      key={classroom._id}
                      value={classroom.name}
                      onSelect={() => {
                        setSelectedClass(classroom._id);
                        setOpen(false); // Close the popover when a classroom is selected
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          classroom._id === selectedClass
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {classroom.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <DialogFooter>
        <Button
          onClick={handleAssign}
          disabled={!selectedClass || isLoading}
          isLoading={isLoading}
        >
          Assign
        </Button>
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
      </DialogFooter>
    </ModalLayout>
  );
};

export default AssignStudentModal;
