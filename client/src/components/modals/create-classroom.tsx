import { useState } from "react";
import { useModal } from "../../stores/modal-store";
import { ModalLayout } from "./modal-layout";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { useShowToast } from "../../hooks/useShowToast";
import axiosInstance from "../../lib/axios-instance";
import { apiUrls } from "../../constants/api-urls";
import { DialogTitle } from "@radix-ui/react-dialog";

const daysOfWeek = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

const CreateClassroomModal = () => {
  const { isOpen, closeModal, type } = useModal();
  const open = type === "create-classroom" && isOpen;

  const [name, setName] = useState("");
  const [timeSlots, setTimeSlots] = useState(
    daysOfWeek.map((day) => ({
      day: day.value,
      isChecked: false,
      startTime: "",
      endTime: "",
    }))
  );

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

  const { showToast } = useShowToast();

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
      showToast("Invalid Data", "Please enter valid data", true);
      return;
    }

    const response = await axiosInstance.post(
      apiUrls.classroom.createClassroom,
      { name, days: selectedTimeSlots }
    );

    if (response.status == 201) {
      showToast(
        "Request Success",
        "classroom has been created successfully",
        false
      );
      closeModal();
    }
  };

  return (
    <ModalLayout isOpen={open} onClose={closeModal}>
      <div className="flex flex-col gap-y-4">
        <DialogTitle className="font-bold mb-4 text-xl">
          Create Classroom
        </DialogTitle>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-sm">Class Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter classroom name"
            required
          />
        </div>
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-6">
            {timeSlots.map((slot, index) => (
              <div key={slot.day} className="flex gap-x-2 items-center">
                <Checkbox
                  checked={slot.isChecked}
                  onChange={() => handleCheckboxChange(index)}
                  onClick={() => handleCheckboxChange(index)}
                />
                <label className="text-sm">{slot.day}</label>
                {slot.isChecked && (
                  <div className=" ml-4 flex gap-x-4 w-full items-center justify-end">
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
        <Button onClick={handleSubmit}>Create</Button>
      </div>
    </ModalLayout>
  );
};

export default CreateClassroomModal;
