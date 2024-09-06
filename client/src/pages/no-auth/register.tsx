import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import useAuthStore from "../../stores/auth-store";
import { useToast } from "../../components/ui/use-toast";
import { validateEmail } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const [schoolName, setSchoolName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isLoading } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!schoolName || !name || !validateEmail(email) || !password) {
      toast({
        title: "Invalid Entry",
        description: "Please fill in all fields with valid information",
        variant: "destructive",
      });
      return;
    }
    // await registerPrincipal({ schoolName, name, email, password });
    navigate("/login", { replace: true });
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
          <form className="space-y-4">
            <div>
              <label
                htmlFor="schoolName"
                className="block text-sm font-medium text-gray-700"
              >
                School Name
              </label>
              <Input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                id="schoolName"
                name="schoolName"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Enter your school name"
              />
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Your Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <Button
                disabled={isLoading}
                onClick={handleRegister}
                type="submit"
                isLoading={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
              >
                Register
              </Button>
            </div>
          </form>
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
