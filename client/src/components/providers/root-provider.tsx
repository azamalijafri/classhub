import { ReactNode, useEffect, useState } from "react";
import ModalProvider from "./modal-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "../ui/toaster";
import { useShowToast } from "@/hooks/useShowToast";
import { setupAxiosInterceptors } from "@/lib/axios-instance";

const RootProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());
  const { showToast } = useShowToast();

  useEffect(() => {
    setupAxiosInterceptors(showToast);
  }, [showToast]);

  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <ModalProvider />
        {children}
        <Toaster />
      </QueryClientProvider>
    </div>
  );
};

export default RootProvider;
