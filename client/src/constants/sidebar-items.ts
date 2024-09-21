import {
  BookType,
  CalendarCheckIcon,
  LayoutDashboardIcon,
  UsersIcon,
} from "lucide-react";

export const PrincipalItems = [
  {
    label: "Classes",
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
];

export const StudentItems = [
  {
    label: "My Class",
    href: "/",
    icon: LayoutDashboardIcon,
  },
];

export const TeacherItems = [
  {
    label: "Class",
    href: "/",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Schedule",
    href: "/schedule",
    icon: CalendarCheckIcon,
  },
];
