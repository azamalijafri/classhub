interface IUser {
  email: string;
  role: "principal" | "teacher" | "student";
}

interface CustomError {
  message: string;
  code?: string | number;
}

interface IProfile {
  name: string;
}
