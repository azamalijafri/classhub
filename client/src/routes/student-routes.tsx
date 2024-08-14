import { Routes, Route } from "react-router-dom";
import { StudentDashboard } from "../pages/student/dashboard";

function StudentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StudentDashboard />} />
    </Routes>
  );
}

export default StudentRoutes;
