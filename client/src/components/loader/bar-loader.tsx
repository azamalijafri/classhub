import { useLoading } from "../../stores/loader-store";

const BarLoader = () => {
  const { isLoading } = useLoading();

  return (
    <div className={`relative h-1 bg-primary/50 ${!isLoading && "hidden"}`}>
      <div className="bg-primary animate-loading-bar w-full h-full absolute animate-loading-bar"></div>
    </div>
  );
};

export default BarLoader;
