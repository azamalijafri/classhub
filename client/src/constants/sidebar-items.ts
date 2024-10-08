import {
  BookOpenIcon,
  BookType,
  CalendarCheckIcon,
  LayoutDashboardIcon,
  UsersIcon,
} from "lucide-react";

export const PrincipalItems = [
  {
    label: "Classrooms",
    href: "/",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Teachers",
    href: "/teachers",
    icon: BookType,
  },
  {
    label: "Students",
    href: "/students",
    icon: UsersIcon,
  },
  {
    label: "Subjects",
    href: "/subjects",
    icon: BookOpenIcon,
  },
];

export const StudentItems = [
  {
    label: "Classroom",
    href: "/",
    icon: LayoutDashboardIcon,
  },
];

export const TeacherItems = [
  {
    label: "Classroom",
    href: "/",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Schedule",
    href: "/schedule",
    icon: CalendarCheckIcon,
  },
  // {
  //   label: "Attendance",
  //   href: "/attendance",
  //   icon: ListCheckIcon,
  // },
];
