import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { ModalLayout } from "./modal-layout";
import { Input } from "@/components/ui/input";
import { useModal } from "../../stores/modal-store";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useToast } from "../ui/use-toast";
import axiosInstance from "@/lib/axios-instance";
import { apiUrls } from "@/constants/api-urls";

interface SubjectForm {
  name: string;
}

const CreateSubjectsModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type === "create-subject");

  const { toast } = useToast();

  const [subjects, setSubjects] = useState<SubjectForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        description: "error uploading file, please try again.",
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
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        apiUrls.subject.createSubjects,
        {
          subjects,
        }
      );

      if (response) {
        closeModal();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalLayout isOpen={!!modal}>
      <DialogTitle>Create Subjects</DialogTitle>
      <div className="flex flex-col gap-y-4">
        <span className="text-xs text-zinc-600">
          upload only cvs or excel file
        </span>
        <div className="flex gap-x-2 items-center">
          <Input
            type="file"
            accept=".csv, .xls, .xlsx"
            onChange={handleFileUpload}
            className="file-input"
          />
          <Button onClick={addSubject}>Add Manually</Button>
        </div>

        {subjects?.map((subject, index) => (
          <div key={index} className="flex gap-x-2 items-center">
            <Input
              placeholder="Subject Name"
              value={subject.name}
              onChange={(e) => handleInputChange(index, "name", e.target.value)}
            />
            <Button variant="destructive" onClick={() => removeSubject(index)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button
          onClick={handleSubmit}
          disabled={!subjects.length || isLoading}
          isLoading={isLoading}
        >
          Submit
        </Button>
        <Button variant="secondary" onClick={closeModal}>
          Cancel
        </Button>
      </DialogFooter>
    </ModalLayout>
  );
};

export default CreateSubjectsModal;
