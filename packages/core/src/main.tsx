import "@fontsource-variable/figtree";
import { createRoot } from "react-dom/client";
import { App } from "./components/dashboard/App";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <App />
    <Toaster />
  </TooltipProvider>
);
