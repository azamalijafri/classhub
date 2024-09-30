import SecondaryLoader from "@/components/loader/secondary-loader";

import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const PrincipalDashboard = lazy(() => import("../pages/principal/dashboard"));
const ClassDetailsLayout = lazy(
  () => import("../components/layout/class-detail-layout")
);
const Timetable = lazy(() => import("../pages/common/timetable"));
const ClassStudents = lazy(() => import("../pages/common/class-students"));
const AllStudents = lazy(() => import("@/pages/principal/students"));
const AllTeachers = lazy(() => import("@/pages/principal/teachers"));
const AllSubjects = lazy(() => import("@/pages/principal/subjects"));

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
          <Route path="/teachers" element={<AllTeachers />} />
          <Route path="/students" element={<AllStudents />} />
          <Route path="/subjects" element={<AllSubjects />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default PrincipalRoutes;
