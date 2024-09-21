import { Routes, Route } from "react-router-dom";
import { TeacherDashboard } from "../pages/teacher/dashboard";
import ClassDetailsLayout from "@/components/class-detail-layout";
import Timetable from "@/pages/common/timetable";
import ClassStudents from "@/pages/common/class-students";
import Schedule from "@/pages/teacher/schedule";

function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TeacherDashboard />} />
      <Route path="/class/:classId" element={<ClassDetailsLayout />}>
        <Route path="timetable" element={<Timetable />} />
        <Route path="students" element={<ClassStudents />} />
      </Route>
      <Route path="/schedule" element={<Schedule />} />
    </Routes>
  );
}

export default TeacherRoutes;
