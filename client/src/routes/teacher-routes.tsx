import { Routes, Route } from "react-router-dom";
import { TeacherDashboard } from "../pages/teacher/dashboard";
import ClassDetailsLayout from "@/components/class-detail-layout";
import Timetable from "@/pages/common/timetable";
import ClassStudents from "@/pages/common/class-students";
import Schedule from "@/pages/teacher/schedule";
import Attendance from "@/pages/teacher/attendance";
import TeacherClassAttendance from "@/components/teacher-class-attendance";

function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TeacherDashboard />} />
      <Route path="/class/:classroomId" element={<ClassDetailsLayout />}>
        <Route path="timetable" element={<Timetable />} />
        <Route path="students" element={<ClassStudents />} />
      </Route>
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route
        path="/attendance/:classroomId"
        element={<TeacherClassAttendance />}
      />
    </Routes>
  );
}

export default TeacherRoutes;
