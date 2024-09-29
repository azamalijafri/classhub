import { useModal } from "../../stores/modal-store";
import { ModalLayout } from "./modal-layout";
import { Button } from "../ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Form } from "../ui/form";
import { useForm } from "react-hook-form";
import {
  CreateBulkTeacherFormValues,
  createSingleTeacherSchema,
  CreateTeacherFormValues,
} from "../../validators/teacher-validator";
import TextInput from "../inputs/text-input";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "../../lib/axios-instance";
import { apiUrls } from "../../constants/api-urls";
import { useState, useEffect } from "react";
import ComboBox from "../inputs/useform-combo-box";
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

const UpsertTeacherModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type == "upsert-teacher");
  const teacher = modal?.data?.teacher;
  const isUpdateMode = !!teacher;

  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<{ id: string; label: string }[]>([]);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [fileTeachers, setFileTeachers] = useState<
    CreateBulkTeacherFormValues["teachers"]
  >([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      const response = await axiosInstance.get(apiUrls.subject.getAllSubjects);
      if (response) {
        setSubjects(
          response.data.subjects.map((subject: ISubject) => ({
            id: subject._id,
            label: subject.name,
          }))
        );
      }
    };
    fetchSubjects();
  }, []);

  const form = useForm<CreateTeacherFormValues>({
    resolver: zodResolver(createSingleTeacherSchema),
    defaultValues: {
      name: teacher?.name || "",
      email: teacher?.user.email || "",
      subject: teacher?.subject._id || "",
      password: "",
    },
  });

  const refetchQuery = useRefetchQuery();

  const { isValid, isSubmitting, errors } = form.formState;

  const handleSubmit = async (values: CreateTeacherFormValues) => {
    try {
      setIsLoading(true);

      const apiUrl = isUpdateMode
        ? `${apiUrls.teacher.updateTeacher}/${teacher._id}`
        : apiUrls.teacher.createTeacher;

      const response = isUpdateMode
        ? await axiosInstance.put(apiUrl, values)
        : await axiosInstance.post(apiUrl, values);

      if (response) {
        refetchQuery(["all", "teachers"]);
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
          const parsedTeachers = parsedData
            .slice(1)
            .map((row) => ({
              name: row[0],
              email: row[1],
              subject: subjects.find((subject) => subject.label == row[2])
                ? row[2]
                : "",
            }))
            .filter((teacher) => teacher.name && teacher.email);
          setFileTeachers(parsedTeachers);
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

        const parsedTeachers = (sheet as string[][])
          .slice(1)
          .map((row) => ({
            name: row[0],
            email: row[1],
            subject: subjects.find((subject) => subject.label == row[2])
              ? row[2]
              : "",
          }))
          .filter((teacher) => teacher.name && teacher.email);
        setFileTeachers(parsedTeachers);
      };
      reader.readAsArrayBuffer(file);
    } else {
      return;
    }
  };

  const handleBulkSubmit = async () => {
    try {
      setIsLoading(true);
      if (fileTeachers.length > 0) {
        const response = await axiosInstance.post(
          apiUrls.teacher.createBulkTeachers,
          {
            teachers: fileTeachers,
          }
        );

        if (response) {
          refetchQuery(["all", "teachers"]);
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
            ? "Update Teacher"
            : isBulkUpload
            ? "Bulk Upload Teachers"
            : "Create Teacher"}
        </DialogTitle>

        {!isUpdateMode && isBulkUpload ? (
          <>
            <span className="text-xs text-zinc-600">
              Upload only csv and excel file
            </span>
            <Input
              type="file"
              accept=".csv, .xls, .xlsx"
              onChange={handleFileUpload}
            />
            {fileTeachers.length > 0 && (
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                  </TableHeader>
                  <TableBody>
                    {fileTeachers.map((teacher, index) => (
                      <TableRow key={index}>
                        <TableCell>{teacher.name}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{teacher.subject}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <Button
              onClick={handleBulkSubmit}
              isLoading={isSubmitting || isLoading}
              disabled={isLoading}
              className="mt-4"
            >
              Submit Bulk Teachers
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
                  description="We will send teacher's credentials on this email"
                  error={errors.email?.message}
                />
              )}
              <ComboBox
                items={subjects}
                control={form.control}
                placeholder="Select Subject"
                label="Subject"
                name="subject"
              />
              <TextInput
                label="Password"
                control={form.control}
                name="password"
                placeholder="Change Password"
                description="only enter if you wish to change password (6 character long)"
                type="password"
                error={errors.password?.message}
              />

              <Button
                isLoading={isSubmitting}
                disabled={isSubmitting || !isValid || isLoading}
              >
                {isUpdateMode ? "Update Teacher" : "Create"}
              </Button>
            </form>
          </Form>
        )}

        {!isUpdateMode && (
          <Button
            variant="secondary"
            onClick={() => setIsBulkUpload(!isBulkUpload)}
          >
            {isBulkUpload ? "Create Single Teacher" : "Bulk Upload"}
          </Button>
        )}
      </div>
    </ModalLayout>
  );
};

export default UpsertTeacherModal;
