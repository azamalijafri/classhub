import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/auth-store";

const noauthpaths = ["/login", "/register"];

const SplashScreen = () => {
  const { user, isLoading } = useAuthStore();
  const pathname = useLocation().pathname;

  if (!isLoading && user && noauthpaths.includes(pathname))
    return <Navigate to={"/"} />;

  return <div>splash screen</div>;
};

export default SplashScreen;
