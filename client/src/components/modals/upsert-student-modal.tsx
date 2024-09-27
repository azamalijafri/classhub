import { useModal } from "../../stores/modal-store";
import { ModalLayout } from "./modal-layout";
import { Button } from "../ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Form } from "../ui/form";
import { useForm } from "react-hook-form";
import {
  CreateStudentFormValues,
  CreateSingleStudentSchema,
  CreateBulkStudentFormValues,
} from "../../validators/student-validator";
import TextInput from "../inputs/text-input";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "../../lib/axios-instance";
import { apiUrls } from "../../constants/api-urls";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useRefetchQuery } from "@/hooks/useRefetchQuery";
import ComboBox from "../inputs/combo-box";
import { Separator } from "../ui/separator";

const UpsertStudentModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type == "upsert-student");
  const student = modal?.data?.student;
  const isUpdateMode = !!student;

  const [isLoading, setIsLoading] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [fileStudents, setFileStudents] = useState<
    CreateBulkStudentFormValues["students"]
  >([]);
  const [classes, setClasses] = useState<{ id: string; label: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | undefined>(
    undefined
  );

  const form = useForm<CreateStudentFormValues>({
    resolver: zodResolver(CreateSingleStudentSchema),
    defaultValues: {
      name: student?.name || "",
      email: student?.user?.email || "",
      roll: student?.roll || "",
    },
  });

  const refetchQuery = useRefetchQuery();
  const { isValid, isSubmitting, errors } = form.formState;

  useEffect(() => {
    const fetchClasses = async () => {
      const response = await axiosInstance.get(
        apiUrls.classroom.getAllClassrooms
      );
      const formattedclasses = response.data.classrooms.map(
        (item: IClassroom) => {
          return { id: item._id, label: item.name };
        }
      );
      setClasses(formattedclasses);
    };

    fetchClasses();
  }, []);

  const handleSubmit = async (values: CreateStudentFormValues) => {
    try {
      setIsLoading(true);

      const apiUrl = isUpdateMode
        ? `${apiUrls.student.updateStudent}/${student._id}`
        : apiUrls.student.createStudent;

      const response = isUpdateMode
        ? await axiosInstance.put(apiUrl, {
            values,
          })
        : await axiosInstance.post(apiUrl, {
            ...values,
            classroom: selectedClass,
          });

      if (response) {
        refetchQuery(["all", "students"]);
        closeModal();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split(".").pop()?.toLowerCase();

    if (fileType === "csv") {
      Papa.parse(file, {
        complete: (result) => {
          const parsedData = result.data as string[][];
          const parsedStudents = parsedData
            .slice(1)
            .map((row) => ({
              name: row[0],
              email: row[1],
              roll: row[2] ? String(row[2]) : "",
            }))
            .filter((student) => student.name && student.email && student.roll);
          setFileStudents(parsedStudents);
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

        const parsedStudents = (sheet as string[][])
          .slice(1)
          .map((row) => ({
            name: row[0],
            email: row[1],
            roll: row[2] ? String(row[2]) : "",
          }))
          .filter((student) => student.name && student.email && student.roll);
        setFileStudents(parsedStudents);
      };
      reader.readAsArrayBuffer(file);
    } else {
      return;
    }
  };

  const handleBulkSubmit = async () => {
    try {
      setIsLoading(true);
      if (fileStudents.length > 0) {
        const response = await axiosInstance.post(
          apiUrls.student.createBulkStudents,
          {
            students: fileStudents,
            classroom: selectedClass,
          }
        );

        if (response) {
          refetchQuery(["all", "students"]);
          closeModal();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!modal) return null;

  return (
    <ModalLayout isOpen={!!modal}>
      <div className="flex flex-col gap-y-4">
        <DialogTitle className="font-bold mb-4 text-xl">
          {isUpdateMode
            ? "Update Student"
            : isBulkUpload
            ? "Bulk Upload Students"
            : "Create Student"}
        </DialogTitle>

        {!isUpdateMode && isBulkUpload ? (
          <>
            <span className="text-xs text-zinc-600">
              Upload only csv or excel file
            </span>
            <Input
              type="file"
              accept=".csv, .xls, .xlsx"
              onChange={handleFileUpload}
            />
            {fileStudents.length > 0 && (
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roll No</TableHead>
                  </TableHeader>
                  <TableBody>
                    {fileStudents.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.roll}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Separator className="mb-4" />

            <ComboBox
              items={classes}
              onSelect={(classroomId) => setSelectedClass(classroomId)}
              selectedValue={selectedClass}
              label="Want to assign to a class?"
              placeholder="Select a class"
            />

            <Button
              onClick={handleBulkSubmit}
              isLoading={isSubmitting || isLoading}
              disabled={isLoading}
              className="mt-4"
            >
              Submit Bulk Students
            </Button>
          </>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-y-4"
            >
              <TextInput
                label="Name"
                control={form.control}
                name="name"
                placeholder="Enter Name"
                type="text"
                error={errors.name?.message}
              />
              {!isUpdateMode && (
                <TextInput
                  label="Email"
                  control={form.control}
                  name="email"
                  placeholder="Enter Email"
                  type="email"
                  description="We will send student's credentials on this email"
                  error={errors.email?.message}
                />
              )}
              {!isUpdateMode && (
                <TextInput
                  label="Roll No"
                  control={form.control}
                  name="roll"
                  placeholder="Enter Roll No"
                  type="text"
                  error={errors.roll?.message}
                />
              )}

              <Separator />

              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting || !isValid || isLoading}
              >
                {isUpdateMode ? "Update Student" : "Create"}
              </Button>
            </form>
          </Form>
        )}

        {!isUpdateMode && !isBulkUpload && (
          <ComboBox
            items={classes}
            onSelect={(classroomId) => setSelectedClass(classroomId)}
            selectedValue={selectedClass}
            label="Want to assign to a class?"
            placeholder="Select a class"
          />
        )}

        {!isUpdateMode && (
          <Button
            variant="secondary"
            onClick={() => setIsBulkUpload(!isBulkUpload)}
            disabled={isSubmitting || isLoading}
          >
            {isBulkUpload ? "Create Single Student" : "Bulk Upload"}
          </Button>
        )}
      </div>
    </ModalLayout>
  );
};

export default UpsertStudentModal;
