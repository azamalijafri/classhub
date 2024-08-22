import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/auth-store";
import { NotebookPenIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const noauthpaths = ["/login", "/register"];

const SplashScreen = () => {
  const { user, isLoading } = useAuthStore();
  const pathname = useLocation().pathname;
  const [quote, setQuote] = useState("");

  const quotes = useMemo(
    () => [
      "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
      "The classroom should be an entrance into the world, not an escape from it. - John Ciardi",
      "Teaching is the one profession that creates all other professions. - Unknown",
      "A teacher affects eternity; he can never tell where his influence stops. - Henry Adams",
      "The best teachers teach from the heart, not from the book. - Unknown",
    ],
    []
  );

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, [quotes]);

  if (!isLoading && user && noauthpaths.includes(pathname))
    return <Navigate to={"/"} />;

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center text-center">
      <NotebookPenIcon className="size-20 mb-4" />
      <span className="text-lg font-semibold">{quote}</span>
    </div>
  );
};

export default SplashScreen;
