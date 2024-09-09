import { useModal } from "../../stores/modal-store";
import { ModalLayout } from "./modal-layout";
import { Button } from "../ui/button";
import { useShowToast } from "../../hooks/useShowToast";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Form } from "../ui/form";
import { useForm } from "react-hook-form";
import {
  CreateStudentFormValues,
  createStudentSchema,
} from "../../validators/create-profile";
import TextInput from "../inputs/text-input";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "../../lib/axios-instance";
import { apiUrls } from "../../constants/api-urls";
import { useQueryClient } from "@tanstack/react-query";

const CreateStudentModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type == "create-student");

  const { showToast } = useShowToast();
  const form = useForm<CreateStudentFormValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      name: "",
      email: "",
      roll: "",
    },
  });

  const { isValid, isSubmitting, errors } = form.formState;

  const queryClient = useQueryClient();

  const handleSubmit = async (values: CreateStudentFormValues) => {
    const response = await axiosInstance.post(
      apiUrls.student.createStudent,
      values
    );

    if (response) {
      queryClient.refetchQueries({queryKey:["all","students"]})
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
              description="We will send student's credentials on this email"
              error={errors.email?.message}
            />
            <TextInput
              label="Roll No"
              control={form.control}
              name="roll"
              placeholder="Enter Student Roll No"
              type="text"
              error={errors.roll?.message}
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
