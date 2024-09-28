import { Navigate, useLocation } from "react-router-dom";
import MainLoader from "./main-loader";
import useAuthStore from "@/stores/auth-store";

const noauthpaths = ["/login", "/register"];

const SplashScreen = () => {
  const { user, isLoading } = useAuthStore();
  const pathname = useLocation().pathname;

  if (!isLoading && user && noauthpaths.includes(pathname)) {
    return <Navigate to={"/"} />;
  }

  return <MainLoader />;
};

export default SplashScreen;
