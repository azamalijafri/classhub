/* eslint-disable react-refresh/only-export-components */
import { JSX } from "react/jsx-runtime";
import { PrincipalDashboard } from "../pages/principal/dashboard";
import { StudentDashboard } from "../pages/student/dashboard";
import { TeacherDashboard } from "../pages/teacher/dashboard";
import useAuthStore from "../stores/auth-store";
import { Routes, useNavigate } from "react-router-dom";
import ProtectedRoute from "./protected-route";
import Layout from "../components/layout";

export const principalRoutes = [
  { path: "/principal/dashboard", component: PrincipalDashboard },
];

export const teacherRoutes = [
  { path: "/teacher/dashboard", component: TeacherDashboard },
];

export const studentRoutes = [
  { path: "/student/dashboard", component: StudentDashboard },
];

const RoleBasedRoutes: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  let roleRoutes: { path: string; component: () => JSX.Element }[] = [];

  switch (user?.role) {
    case "principal":
      roleRoutes = principalRoutes;
      break;
    case "teacher":
      roleRoutes = teacherRoutes;
      break;
    case "student":
      roleRoutes = studentRoutes;
      break;
    default:
      logout();
      navigate("/login", { replace: true });
  }

  return (
    <Layout>
      <Routes>
        {roleRoutes.map((route, index) => (
          <ProtectedRoute
            key={index}
            path={route.path}
            component={route.component}
          />
          // <Route path={route.path} element={<route.component />} />
        ))}
      </Routes>
    </Layout>
  );
};

export default RoleBasedRoutes;
