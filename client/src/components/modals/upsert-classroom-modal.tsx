import { useState, useEffect } from "react";
import { useModal } from "../../stores/modal-store";
import { ModalLayout } from "./modal-layout";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { apiUrls } from "../../constants/api-urls";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import ComboBox from "../inputs/combo-box";
import { XIcon } from "lucide-react";
import { useApi } from "@/hooks/useApiRequest";

const UpsertClassroomModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type === "upsert-classroom");
  const classroomId = modal?.data?.classroomId;

  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState<{ id: string; label: string }[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const { mutateData, isLoading } = useApi({ enabledFetch: false });

  const { data: subjectsData, fetchData: fetchSubjects } = useApi<{
    subjects: ISubject[];
  }>({
    apiUrl: apiUrls.subject.getAllSubjects,
    queryKey: ["subjects"],
    enabledFetch: false,
  });

  const { data: classroomDetailsData, fetchData: fetchClassroomDetails } =
    useApi({
      apiUrl: classroomId
        ? `${apiUrls.classroom.getClassroomDetails}/${classroomId}`
        : "",
      queryKey: ["classroom-details", classroomId],
      enabledFetch: false,
    });

  const { data: classroomSubjectsData, fetchData: fetchClassroomSubjects } =
    useApi({
      apiUrl: classroomId
        ? `${apiUrls.classroom.getClassroomSubjects}/${classroomId}`
        : "",
      queryKey: ["classroom-subjects", classroomId],
      enabledFetch: false,
    });

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    if (classroomId) {
      fetchClassroomDetails();
      fetchClassroomSubjects();
    }
  }, [classroomId, fetchClassroomDetails, fetchClassroomSubjects]);

  useEffect(() => {
    if (classroomDetailsData) {
      setName(classroomDetailsData.classroom.name);
    }

    if (subjectsData) {
      const formattedSubjects = subjectsData.subjects.map((sub: ISubject) => {
        return { id: sub._id, label: sub.name };
      });
      setSubjects(formattedSubjects);
    }

    if (classroomSubjectsData) {
      const selectedSubjects = classroomSubjectsData.subjects.map(
        (sub: ISubject) => sub._id
      );

      setSelectedSubjects(selectedSubjects);
    }
  }, [classroomDetailsData, classroomSubjectsData, subjectsData]);

  const handleSubjectSelect = (subjectId: string) => {
    if (!selectedSubjects.includes(subjectId)) {
      setSelectedSubjects((prev) => [...prev, subjectId]);
    }
  };

  const handleRemoveSubject = (subjectId: string) => {
    setSelectedSubjects((prev) => prev.filter((id) => id !== subjectId));
  };

  const handleSubmit = async () => {
    const url = classroomId
      ? `${apiUrls.classroom.updateClassroom}/${classroomId}`
      : apiUrls.classroom.createClassroom;

    await mutateData({
      url,
      method: classroomId ? "PUT" : "POST",
      payload: {
        name,
        subjects: selectedSubjects,
      },
      queryKey: ["all-classrooms"],
    });
    closeModal();
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
          isLoading={isLoading}
          disabled={isLoading}
        >
          {classroomId ? "Save Changes" : "Create"}
        </Button>
      </div>
    </ModalLayout>
  );
};

export default UpsertClassroomModal;
