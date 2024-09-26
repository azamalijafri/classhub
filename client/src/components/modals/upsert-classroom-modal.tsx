import { useState, useEffect } from "react";
import { useModal } from "../../stores/modal-store";
import { ModalLayout } from "./modal-layout";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axiosInstance from "../../lib/axios-instance";
import { apiUrls } from "../../constants/api-urls";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useRefetchQuery } from "@/hooks/useRefetchQuery";
import ComboBox from "../inputs/combo-box";
import { XIcon } from "lucide-react";

const UpsertClassroomModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type === "upsert-classroom");
  const classroomId = modal?.data?.classroomId;

  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState<{ id: string; label: string }[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const fetchClassData = async () => {
      if (!classroomId) return;

      try {
        const [detailsResponse, subjectsResponse] = await Promise.all([
          axiosInstance.get(
            `${apiUrls.classroom.getClassroomDetails}/${classroomId}`
          ),
          axiosInstance.get(
            `${apiUrls.classroom.getClassroomSubjects}/${classroomId}`
          ),
        ]);

        setName(detailsResponse.data.classroom.name);
        const subjects = subjectsResponse?.data?.subjects?.map(
          (sub: ISubject) => sub._id
        );
        setSelectedSubjects(subjects);
      } catch (error) {
        console.error("Failed to fetch class data", error);
      }
    };

    fetchClassData();
  }, [classroomId]);

  const handleSubjectSelect = (subjectId: string) => {
    if (!selectedSubjects.includes(subjectId)) {
      setSelectedSubjects((prev) => [...prev, subjectId]);
    }
  };

  const handleRemoveSubject = (subjectId: string) => {
    setSelectedSubjects((prev) => prev.filter((id) => id !== subjectId));
  };

  //   selectedTimeSlots: {
  //     day: string;
  //     isChecked: boolean;
  //     startTime: string;
  //     endTime: string;
  //   }[]
  // ) => {
  //   if (!name) return false;
  //   for (const timeslot of selectedTimeSlots) {
  //     if (!timeslot.startTime || !timeslot.endTime) return false;
  //   }
  //   if (!selectedSubjects.length) return false;

  //   return true;
  // };

  const handleSubmit = async () => {
    const requestData = {
      name,
      subjects: selectedSubjects,
    };

    setIsSubmitting(true);
    try {
      if (classroomId) {
        await axiosInstance.put(
          `${apiUrls.classroom.updateClassroom}/${classroomId}`,
          requestData
        );
      } else {
        await axiosInstance.post(
          apiUrls.classroom.createClassroom,
          requestData
        );
      }

      refetchQuery(["classrooms"]);
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalLayout isOpen={!!modal} maxWidth="max-w-xl">
      <div className="flex flex-col gap-y-4">
        <DialogTitle className="font-semibold mb-4 text-2xl">
          {classroomId ? "Edit Classroom" : "Create Classroom"}
        </DialogTitle>
        <div className="flex flex-col space-y-2">
          <Label>Class Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter classroom name"
            required
          />
        </div>

        <Separator />

        <div className="space-y-8">
          <div className="flex flex-col col-span-3 space-y-3">
            <ComboBox
              pickMode={true}
              items={subjects}
              label="Subjects"
              onSelect={handleSubjectSelect}
              placeholder="Select Subjects"
              selectedValue=""
            />

            <div className="grid grid-cols-2 space-x-2 gap-y-2">
              {selectedSubjects.map((subjectId) => {
                const subject = subjects.find((sub) => sub.id === subjectId);
                return (
                  <div
                    key={subjectId}
                    className="flex items-center gap-x-2 bg-gray-100 p-2 rounded overflow-hidden justify-between"
                  >
                    <span className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                      {subject?.label}
                    </span>
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
        </div>

        <Button
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {classroomId ? "Save Changes" : "Create"}
        </Button>
      </div>
    </ModalLayout>
  );
};

export default UpsertClassroomModal;
