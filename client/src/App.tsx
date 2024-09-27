import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./stores/auth-store";
import RootProvider from "./components/providers/root-provider";
import MainLoader from "./components/main-loader";

const SplashScreen = lazy(() => import("./components/splash-screen"));
const Layout = lazy(() => import("./components/layout"));
const Login = lazy(() => import("./pages/no-auth/login"));
const Register = lazy(() => import("./pages/no-auth/register"));
const PrincipalRoutes = lazy(() => import("./routes/principal-routes"));
const TeacherRoutes = lazy(() => import("./routes/teacher-routes"));
const StudentRoutes = lazy(() => import("./routes/student-routes"));

function App() {
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
    <div className="w-full">
      <BrowserRouter>
        <RootProvider>
          {isLoading ? (
            <Suspense fallback={<MainLoader />}>
              <SplashScreen />
            </Suspense>
          ) : (
            <Suspense fallback={<MainLoader />}>
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
        </RootProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
