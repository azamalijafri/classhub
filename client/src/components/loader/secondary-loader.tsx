import { Loader2Icon } from "lucide-react";

const SecondaryLoader = () => {
  return (
    <div className="w-full h-screen mb-20 flex flex-col items-center justify-center text-center">
      <Loader2Icon className={`text-primary size-8 animate-spin`} />
    </div>
  );
};

export default SecondaryLoader;
