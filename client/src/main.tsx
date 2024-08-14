import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "./components/ui/toaster.tsx";
import RootProvider from "./components/providers/root-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootProvider>
      <App />
      <Toaster />
    </RootProvider>
  </StrictMode>
);
