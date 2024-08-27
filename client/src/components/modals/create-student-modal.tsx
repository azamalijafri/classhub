import { useModal } from "../../stores/modal-store";
import { ModalLayout } from "./modal-layout";
import { Button } from "../ui/button";
import { useShowToast } from "../../hooks/useShowToast";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Form } from "../ui/form";
import { useForm } from "react-hook-form";
import {
  CreateTeacherFormValues,
  createTeacherSchema,
} from "../../validators/create-teacher";
import TextInput from "../inputs/text-input";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "../../lib/axios-instance";
import { apiUrls } from "../../constants/api-urls";

const CreateStudentModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type == "create-student");

  const { showToast } = useShowToast();
  const form = useForm<CreateTeacherFormValues>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { isValid, isSubmitting, errors } = form.formState;

  const handleSubmit = async (values: CreateTeacherFormValues) => {
    const response = await axiosInstance.post(
      apiUrls.student.createStudent,
      values
    );

    if (response) {
      showToast({
        title: "Request Success",
        description: "Student has been created successfully",
      });
      closeModal();
    }
  };

  if (!modal) return null;

  return (
    <ModalLayout isOpen={!!modal}>
      <div className="flex flex-col gap-y-4">
        <DialogTitle className="font-bold mb-4 text-xl">
          Create Student
        </DialogTitle>
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
            <TextInput
              label="Email"
              control={form.control}
              name="email"
              placeholder="Enter Email"
              type="email"
              error={errors.email?.message}
            />
            <TextInput
              label="Password"
              control={form.control}
              name="password"
              placeholder="Enter Password"
              type="password"
              error={errors.password?.message}
            />
            <Button
              isLoading={isSubmitting}
              disabled={isSubmitting || !isValid}
            >
              Create
            </Button>
          </form>
        </Form>
      </div>
    </ModalLayout>
  );
};

export default CreateStudentModal;
