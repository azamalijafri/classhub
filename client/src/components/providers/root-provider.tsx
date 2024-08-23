import { ReactNode } from "react";
import ModalProvider from "./modal-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";

const RootProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();

  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <ModalProvider />
        {children}
        {/* <Toaster /> */}
        <ToastContainer />
      </QueryClientProvider>
    </div>
  );
};

export default RootProvider;
