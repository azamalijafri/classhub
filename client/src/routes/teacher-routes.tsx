import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import SecondaryLoader from "@/components/loader/secondary-loader";

const TeacherDashboard = lazy(() => import("../pages/teacher/dashboard"));
const Timetable = lazy(() => import("@/pages/common/timetable"));
const ClassStudents = lazy(() => import("@/pages/common/class-students"));
const Schedule = lazy(() => import("@/pages/teacher/schedule"));
const TeacherAttendanceView = lazy(() => import("@/pages/teacher/attendance"));
const ClassDetailsLayout = lazy(
  () => import("@/components/layout/class-detail-layout")
);
const TeacherClassAttendance = lazy(
  () => import("@/components/teacher/teacher-class-attendance")
);

function TeacherRoutes() {
  return (
    <Suspense fallback={<SecondaryLoader />}>
      <Routes>
        <Route path="/" element={<TeacherDashboard />} />
        <Route path="/class/:classroomId" element={<ClassDetailsLayout />}>
          <Route path="timetable" element={<Timetable />} />
          <Route path="students" element={<ClassStudents />} />
          <Route path="attendance" element={<TeacherAttendanceView />} />
        </Route>
        <Route path="/schedule" element={<Schedule />} />
        <Route
          path="/attendance/:classroomId"
          element={<TeacherClassAttendance />}
        />
      </Routes>
    </Suspense>
  );
}

export default TeacherRoutes;
