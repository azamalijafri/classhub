import React, { useEffect } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios-instance";
import { apiUrls } from "@/constants/api-urls";
import { useForm } from "react-hook-form";
import { RegisterFormValues, registerSchema } from "@/validators/register";
import { Form } from "@/components/ui/form";
import TextInput from "@/components/inputs/text-input";
import { zodResolver } from "@hookform/resolvers/zod";

const RegisterPage: React.FC = () => {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      schoolName: "",
      email: "",
      password: "",
      principalName: "",
      schoolCode: "",
    },
  });

  const { isSubmitting, errors } = form.formState;

  const navigate = useNavigate();

  const handleRegister = async (values: RegisterFormValues) => {
    const response = await axiosInstance.post(
      apiUrls.school.registerPrincipal,
      values
    );
    if (response) {
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    document.title = "Register";
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Card className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <CardHeader className="mb-4">
          <h4 className="text-center text-zinc-800 font-bold text-2xl">
            Create School Account
          </h4>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleRegister)}
            >
              <TextInput
                control={form.control}
                label="School Name"
                name="schoolName"
                placeholder="Enter School Name"
                type="text"
                error={errors.schoolName?.message}
              />
              <TextInput
                control={form.control}
                label="School Code"
                name="schoolCode"
                placeholder="Enter School Abbreviation"
                type="text"
                description="This will be used in your school emails"
                error={errors.schoolCode?.message}
              />
              <TextInput
                control={form.control}
                label="Principal Name"
                name="principalName"
                placeholder="Enter Principal Name"
                type="text"
                error={errors.principalName?.message}
              />
              <TextInput
                control={form.control}
                label="Email"
                name="email"
                placeholder="Enter Email"
                type="email"
                error={errors.email?.message}
              />
              <TextInput
                control={form.control}
                label="Password"
                name="password"
                placeholder="Enter Password"
                type="password"
                error={errors.password?.message}
              />
              <Button
                disabled={isSubmitting}
                type="submit"
                isLoading={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
              >
                Register
              </Button>
            </form>
          </Form>

          <div className="mt-4">
            <span
              className="text-sm underline underline-offset-2 cursor-pointer transition-all"
              onClick={() => navigate("/login")}
            >
              Already have an account?
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
