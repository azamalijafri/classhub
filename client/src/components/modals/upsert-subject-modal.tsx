import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { ModalLayout } from "./modal-layout";
import { Input } from "@/components/ui/input";
import { useModal } from "../../stores/modal-store";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useToast } from "../ui/use-toast";
import { apiUrls } from "@/constants/api-urls";
import { useApi } from "@/hooks/useApiRequest";

interface SubjectForm {
  name: string;
}

const UpsertSubjectsModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type === "upsert-subject");
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<SubjectForm[]>([]);
  const isEditing = !!modal?.data?.subject;

  const { mutateData, isLoading } = useApi({ enabledFetch: false });

  useEffect(() => {
    if (isEditing && modal?.data?.subject) {
      setSubjects([{ name: modal.data.subject.name }]);
    }
  }, [isEditing, modal]);

  const handleInputChange = (
    index: number,
    field: keyof SubjectForm,
    value: string
  ) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index][field] = value;
    setSubjects(updatedSubjects);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        const fileType = file.name.split(".").pop()?.toLowerCase();
        if (fileType === "csv") {
          Papa.parse(file, {
            complete: (result) => {
              const parsedData = result.data as string[][];
              const parsedSubjects = parsedData
                .map((row) => ({ name: row[0] }))
                .filter((subject) => subject.name);
              setSubjects((prev) => [...prev, ...parsedSubjects]);
            },
            header: false,
          });
        } else if (fileType === "xls" || fileType === "xlsx") {
          const reader = new FileReader();
          reader.onload = (event) => {
            const binaryStr = event.target?.result;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
              header: 1,
            });

            const parsedSubjects = (sheet as string[][])
              .slice(1)
              .map((row) => ({ name: row[0] }))
              .filter((subject) => subject.name);
            setSubjects((prev) => [...prev, ...parsedSubjects]);
          };
          reader.readAsArrayBuffer(file);
        } else {
          return;
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Error uploading file, please try again.",
        variant: "destructive",
      });
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "" }]);
  };

  const removeSubject = (index: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects.splice(index, 1);
    setSubjects(updatedSubjects);
  };

  const handleSubmit = async () => {
    const apiEndpoint = isEditing
      ? `${apiUrls.subject.updateSubject}/${modal?.data?.subject?._id}`
      : apiUrls.subject.createSubjects;

    const method = isEditing ? "PUT" : "POST";

    await mutateData({
      url: apiEndpoint,
      method,
      payload: isEditing ? subjects[0] : subjects,
      queryKey: ["all-subjects"],
    });

    closeModal();
  };

  return (
    <ModalLayout isOpen={!!modal}>
      <DialogTitle>
        {isEditing ? "Update Subject" : "Create Subjects"}
      </DialogTitle>
      <div className="flex flex-col gap-y-4">
        {!isEditing && (
          <span className="text-xs text-zinc-600">
            Upload only CSV or Excel file
          </span>
        )}
        <div className="flex gap-x-2 items-center">
          {!isEditing && (
            <>
              <Input
                type="file"
                accept=".csv, .xls, .xlsx"
                onChange={handleFileUpload}
                className="file-input"
              />
              <Button onClick={addSubject}>Add Manually</Button>
            </>
          )}
        </div>

        {subjects?.map((subject, index) => (
          <div key={index} className="flex gap-x-2 items-center">
            <Input
              placeholder="Subject Name"
              value={subject.name}
              onChange={(e) => handleInputChange(index, "name", e.target.value)}
            />
            {!isEditing && (
              <Button
                variant="destructive"
                onClick={() => removeSubject(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button
          onClick={handleSubmit}
          disabled={!subjects.length || isLoading}
          isLoading={isLoading}
        >
          {isEditing ? "Update" : "Submit"}
        </Button>
        <Button variant="secondary" onClick={closeModal}>
          Cancel
        </Button>
      </DialogFooter>
    </ModalLayout>
  );
};

export default UpsertSubjectsModal;
