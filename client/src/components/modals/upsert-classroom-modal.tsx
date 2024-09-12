import { useState, useEffect } from "react";
import { useModal } from "../../stores/modal-store";
import { ModalLayout } from "./modal-layout";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { useShowToast } from "../../hooks/useShowToast";
import axiosInstance from "../../lib/axios-instance";
import { apiUrls } from "../../constants/api-urls";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useQueryClient } from "@tanstack/react-query";

const daysOfWeek = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

const UpsertClassroomModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type === "upsert-classroom");
  const classId = modal?.data?.classId;
  const [name, setName] = useState("");
  const [timeSlots, setTimeSlots] = useState(
    daysOfWeek.map((day) => ({
      day: day.value,
      isChecked: false,
      startTime: "",
      endTime: "",
    }))
  );

  const { showToast } = useShowToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (classId) {
      // Fetch classroom details if editing
      const fetchClassDetails = async () => {
        const response = await axiosInstance.get(
          `${apiUrls.classroom.getClassroomDetails}/${classId}`
        );
        setName(response.data.classroom.name);
        setTimeSlots(
          daysOfWeek.map((day) => {
            const dayDetails = response.data.classroom.days.find(
              (d: { day: string }) => d.day === day.value
            );
            return {
              day: day.value,
              isChecked: !!dayDetails,
              startTime: dayDetails?.startTime || "",
              endTime: dayDetails?.endTime || "",
            };
          })
        );
      };

      fetchClassDetails();
    }
  }, [classId]);

  const handleCheckboxChange = (index: number) => {
    setTimeSlots((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, isChecked: !slot.isChecked } : slot
      )
    );
  };

  const handleTimeChange = (
    index: number,
    timeType: "startTime" | "endTime",
    value: string
  ) => {
    setTimeSlots((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, [timeType]: value } : slot
      )
    );
  };

  const validateData = (
    selectedTimeSlots: {
      day: string;
      isChecked: boolean;
      startTime: string;
      endTime: string;
    }[]
  ) => {
    if (!name) return false;
    for (const timeslot of selectedTimeSlots) {
      if (!timeslot.startTime || !timeslot.endTime) return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const selectedTimeSlots = timeSlots.filter((slot) => slot.isChecked);
    if (!validateData(selectedTimeSlots)) {
      showToast({
        title: "Invalid Data",
        description: "Please enter valid data",
        isDestructive: true,
      });
      return;
    }

    const requestData = { name, days: selectedTimeSlots };
    let response;

    if (classId) {
      // Update existing classroom
      response = await axiosInstance.put(
        `${apiUrls.classroom.updateClassroom}/${classId}`,
        requestData
      );
    } else {
      // Create new classroom
      response = await axiosInstance.post(
        apiUrls.classroom.createClassroom,
        requestData
      );
    }

    if (response) {
      queryClient.refetchQueries({ queryKey: ["classrooms"] });
      closeModal();
    }
  };

  return (
    <ModalLayout isOpen={!!modal}>
      <div className="flex flex-col gap-y-4">
        <DialogTitle className="font-bold mb-4 text-2xl">
          {classId ? "Edit Classroom" : "Create Classroom"}
        </DialogTitle>
        <div className="flex flex-col">
          <Label className="mb-1 text-base">Class Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter classroom name"
            required
          />
        </div>
        <Separator />
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-6">
            {timeSlots.map((slot, index) => (
              <div key={slot.day} className="flex gap-x-2 items-center">
                <Checkbox
                  checked={slot.isChecked}
                  onChange={() => handleCheckboxChange(index)}
                  onClick={() => handleCheckboxChange(index)}
                />
                <label className="">{slot.day}</label>
                {slot.isChecked && (
                  <div className="ml-4 flex gap-x-4 w-full items-center justify-end">
                    <div className="flex gap-x-2 items-center">
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          handleTimeChange(index, "startTime", e.target.value)
                        }
                        required
                      />
                    </div>
                    <span className="font-medium">to</span>
                    <div className="flex gap-x-2 items-center">
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          handleTimeChange(index, "endTime", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <Button onClick={handleSubmit}>
          {classId ? "Save Changes" : "Create"}
        </Button>
      </div>
    </ModalLayout>
  );
};

export default UpsertClassroomModal;
