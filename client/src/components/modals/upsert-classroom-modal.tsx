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
import { useRefetchQuery } from "@/hooks/useRefetchQuery";
import ComboBox from "../inputs/combo-box";
import { XIcon } from "lucide-react";

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
  const [subjects, setSubjects] = useState<{ id: string; label: string }[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const { showToast } = useShowToast();
  const refetchQuery = useRefetchQuery();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axiosInstance.get(
          apiUrls.subject.getAllSubjects
        );
        const formattedSubjects = response.data.subjects.map(
          (sub: ISubject) => {
            return { id: sub._id, label: sub.name };
          }
        );
        setSubjects(formattedSubjects);
      } catch (error) {
        console.error("Failed to fetch subjects", error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    if (classId) {
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

  const handleSubjectSelect = (subjectId: string) => {
    if (!selectedSubjects.includes(subjectId)) {
      setSelectedSubjects((prev) => [...prev, subjectId]);
    }
  };

  const handleRemoveSubject = (subjectId: string) => {
    setSelectedSubjects((prev) => prev.filter((id) => id !== subjectId));
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
    if (!selectedSubjects.length) return false;

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

    const requestData = {
      name,
      days: selectedTimeSlots,
      subjects: selectedSubjects,
    };
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
      refetchQuery(["classrooms"]);
      closeModal();
    }
  };

  return (
    <ModalLayout isOpen={!!modal} maxWidth="max-w-6xl">
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

        <div className="grid grid-cols-6 space-x-4">
          <div className="flex flex-col col-span-3">
            <ComboBox
              items={subjects}
              label="Subjects"
              onSelect={handleSubjectSelect}
              placeholder="Select Subjects"
              selectedValue=""
            />

            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSubjects.map((subjectId) => {
                const subject = subjects.find((sub) => sub.id === subjectId);
                return (
                  <div
                    key={subjectId}
                    className="flex items-center gap-x-2 bg-gray-100 p-2 rounded"
                  >
                    <span className="text-sm">{subject?.label}</span>
                    <XIcon
                      className="size-4 cursor-pointer"
                      onClick={() => handleRemoveSubject(subjectId)}
                    >
                      Remove
                    </XIcon>
                  </div>
                );
              })}
            </div>
          </div>

          {/* <Separator /> */}

          <div className="flex flex-col gap-y-4 col-span-3">
            <Label>Class Days</Label>
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
        </div>

        <Button onClick={handleSubmit}>
          {classId ? "Save Changes" : "Create"}
        </Button>
      </div>
    </ModalLayout>
  );
};

export default UpsertClassroomModal;
