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

interface IStudent {
  _id: string;
  name: string;
  user: IUser;
  rollNo: string;
  classroom: IClassroom;
}

interface ITeacher {
  _id: string;
  name: string;
  user: Types.ObjectId;
  school: Types.ObjectId;
  subject: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface ISubject {
  _id: string;
  name: string;
  school: Types.ObjectId;
  createdBy: Date;
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
