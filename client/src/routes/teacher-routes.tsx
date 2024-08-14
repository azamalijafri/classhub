import { Routes, Route } from "react-router-dom";
import { TeacherDashboard } from "../pages/teacher/dashboard";

function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TeacherDashboard />} />
    </Routes>
  );
}

export default TeacherRoutes;
