import React, { useEffect } from "react";
import { Route, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth-store";
import SplashScreen from "../components/splash-screen";

interface ProtectedRouteProps {
  component: React.ComponentType<unknown>;
  path: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  path,
  ...rest
}) => {
  const navigate = useNavigate();

  const { role, isAuthenticated, loading, fetchProfile } = useAuthStore();

  // useEffect(() => {
  //   if (role) {
  //     fetchProfile();
  //   }
  // }, [role, fetchProfile]);

  if (!loading && !isAuthenticated()) {
    navigate("/", { replace: true });
  }

  if (loading) return <SplashScreen />;

  return <Route {...rest} path={path} element={<Component />} />;
};

export default ProtectedRoute;
