import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./stores/auth-store";
import SplashScreen from "./components/splash-screen";
import Layout from "./components/layout";
import { useShowToast } from "./hooks/useShowToast";
import { setupAxiosInterceptors } from "./lib/axios-instance";
import RootProvider from "./components/providers/root-provider";

const Login = lazy(() => import("./pages/no-auth/login"));
const Register = lazy(() => import("./pages/no-auth/register"));
const PrincipalRoutes = lazy(() => import("./routes/principal-routes"));
const TeacherRoutes = lazy(() => import("./routes/teacher-routes"));
const StudentRoutes = lazy(() => import("./routes/student-routes"));

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
    <RootProvider>
      <BrowserRouter>
        {isLoading ? (
          <SplashScreen />
        ) : (
          <Suspense fallback={<SplashScreen />}>
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
          </Suspense>
        )}
      </BrowserRouter>
    </RootProvider>
  );
}

export default App;
