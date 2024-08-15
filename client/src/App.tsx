import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./stores/auth-store";
import Login from "./pages/no-auth/login";
import { Register } from "./pages/no-auth/register";
import SplashScreen from "./components/splash-screen";
import PrincipalRoutes from "./routes/principal-routes";
import TeacherRoutes from "./routes/teacher-routes";
import StudentRoutes from "./routes/student-routes";
import Layout from "./components/layout";
import { useShowToast } from "./hooks/useShowToast";
import { setupAxiosInterceptors } from "./lib/axios-instance";

function App() {
  const { showToast } = useShowToast();

  setupAxiosInterceptors(showToast);

  const { user, initializeAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await initializeAuth();
      setIsLoading(false);
    };

    initAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      {isLoading ? (
        <SplashScreen />
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              user ? (
                <Layout>
                  {user.role === "principal" && <PrincipalRoutes />}
                  {user.role === "teacher" && <TeacherRoutes />}
                  {user.role === "student" && <StudentRoutes />}
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
