import { Routes, Route } from "react-router-dom";
import { PrincipalDashboard } from "../pages/principal/dashboard";
import ClassDetailsLayout from "../components/class-detail-layout";
import Timetable from "../pages/common/timetable";
import ClassStudents from "../pages/common/class-students";
import Students from "@/pages/principal/students";

function PrincipalRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PrincipalDashboard />} />
      <Route path="/class/:classId" element={<ClassDetailsLayout />}>
        <Route path="timetable" element={<Timetable />} />
        <Route path="students" element={<ClassStudents />} />
      </Route>
      <Route path="/students" element={<Students />}/>
    </Routes>
  );
}

export default PrincipalRoutes;
