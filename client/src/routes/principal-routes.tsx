import { Routes, Route } from "react-router-dom";
import { PrincipalDashboard } from "../pages/principal/dashboard";
import ClassDetailsLayout from "../components/class-detail-layout";
import Timetable from "../pages/common/timetable";
import ClassStudents from "../pages/common/class-students";
import AllStudents from "@/pages/principal/students";
import Teachers from "@/pages/principal/teachers";

function PrincipalRoutes() {
  return (
    <div className="w-full">
      <Routes>
        <Route path="/" element={<PrincipalDashboard />} />
        <Route path="/class/:classroomId" element={<ClassDetailsLayout />}>
          <Route path="timetable" element={<Timetable />} />
          <Route path="students" element={<ClassStudents />} />
        </Route>
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/students" element={<AllStudents />} />
      </Routes>
    </div>
  );
}

export default PrincipalRoutes;
