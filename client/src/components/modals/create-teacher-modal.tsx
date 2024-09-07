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

const CreateTeacherModal = () => {
  const { modals, closeModal } = useModal();
  const modal = modals.find((modal) => modal.type == "create-teacher");

  const { showToast } = useShowToast();
  const form = useForm<CreateTeacherFormValues>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const { isValid, isSubmitting, errors } = form.formState;

  const handleSubmit = async (values: CreateTeacherFormValues) => {
    const response = await axiosInstance.post(
      apiUrls.teacher.createTeacher,
      values
    );

    if (response) {
      showToast({
        title: "Request Success",
        description: "Teacher has been created successfully",
      });
      closeModal();
    }
  };

  if (!modal) return null;

  return (
    <ModalLayout isOpen={!!modal}>
      <div className="flex flex-col gap-y-4">
        <DialogTitle className="font-bold mb-4 text-xl">
          Create Teacher
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
              description="We will send teacher's credentials on this email"
              error={errors.email?.message}
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

export default CreateTeacherModal;
