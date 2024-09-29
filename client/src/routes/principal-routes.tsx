import SecondaryLoader from "@/components/loader/secondary-loader";
import Subjects from "@/pages/principal/subject";
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const PrincipalDashboard = lazy(() => import("../pages/principal/dashboard"));
const ClassDetailsLayout = lazy(
  () => import("../components/layout/class-detail-layout")
);
const Timetable = lazy(() => import("../pages/common/timetable"));
const ClassStudents = lazy(() => import("../pages/common/class-students"));
const AllStudents = lazy(() => import("@/pages/principal/students"));
const Teachers = lazy(() => import("@/pages/principal/teachers"));

function PrincipalRoutes() {
  return (
    <div className="w-full">
      <Suspense fallback={<SecondaryLoader />}>
        <Routes>
          <Route path="/" element={<PrincipalDashboard />} />
          <Route path="/class/:classroomId" element={<ClassDetailsLayout />}>
            <Route path="timetable" element={<Timetable />} />
            <Route path="students" element={<ClassStudents />} />
          </Route>
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/students" element={<AllStudents />} />
          <Route path="/subjects" element={<Subjects />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default PrincipalRoutes;
