import { useEffect, useState } from "react";
import { apiUrls } from "../../constants/api-urls";
import axiosInstance from "../../lib/axios-instance";
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
import { useQueryClient } from "@tanstack/react-query";
import { useShowToast } from "@/hooks/useShowToast";

const AssignStudentModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type === "assign-students");
  const selectedStudents = modal?.data?.selectedStudents;
  const [classrooms, setClassrooms] = useState<IClassroom[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchClassrooms = async () => {
    const response = await axiosInstance.get(
      apiUrls.classroom.getAllClassrooms
    );
    if (response) setClassrooms(response.data.classrooms);
  };

  useEffect(() => {
    if (modal) {
      fetchClassrooms();
    }
  }, [modal]);

  const queryClient = useQueryClient();
  const { showToast } = useShowToast();

  const handleAssign = async () => {
    const response = await axiosInstance.post(
      apiUrls.classroom.assignStudents,
      { studentsIds: selectedStudents, classroomId: selectedClass }
    );
    if (response) {
      showToast({
        title: "Request success",
        description: "Students assigned succeessfully",
      });
      queryClient.refetchQueries({ queryKey: ["all", "students"] });
      closeModal();
    }
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
                ? classrooms.find(
                    (classroom) => classroom._id === selectedClass
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
                  {classrooms.map((classroom) => (
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
        <Button onClick={handleAssign} disabled={!selectedClass}>
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
