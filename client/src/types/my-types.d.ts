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
  teacher: ITeacher;
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
  user: IUser;
  school: ISchool;
  subject: ISubject;
  createdAt: Date;
  updatedAt: Date;
}

interface ISchool {
  _id: string;
  name: string;
  principal: IPrincipal;
  schoolCode: string;
  address?: string;
  contactInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IPrincipal {
  _id: string;
  name: string;
  user: IUser;
  school?: ISchool;
}

interface ISubject {
  _id: string;
  name: string;
  school: ISchool;
  createdBy: Date;
}

interface IPeriod {
  _id: string;
  teacher: ITeacher;
  subject: ISubject;
  startTime: string;
  endTime: string;
}

interface ITimetable {
  day: string;
  periods: IPeriod[];
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
