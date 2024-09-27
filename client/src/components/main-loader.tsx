import { CoffeeIcon, Loader2Icon } from "lucide-react";

const MainLoader = ({ noSpinner }: { noSpinner?: boolean }) => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center text-center">
      <Loader2Icon
        className={`${
          noSpinner && "opacity-0"
        } text-primary size-12 mb-4 animate-spin`}
      />

      <div className="flex items-start space-x-2">
        <h1 className="text-primary text-3xl font-semibold mb-2">
          Have a coffee
        </h1>
        <CoffeeIcon className="size-8" />
      </div>

      <p className="text-primary text-lg">
        while we are fetching necessary data
      </p>
    </div>
  );
};

export default MainLoader;
