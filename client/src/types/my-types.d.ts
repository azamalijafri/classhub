interface IUser {
  email: string;
  role: "principal" | "teacher" | "student";
}

interface CustomError {
  message: string;
  code?: string | number;
}

interface IProfile {
  _id: string;
  name: string;
  user: IUser;
}

interface ITimeSlot {
  day: Day;
  startTime: string;
  endTime: string;
}

interface IClassroom {
  _id: string;
  name: string;
  days: ITimeSlot[];
  teacher: IProfile;
}

enum Day {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}
