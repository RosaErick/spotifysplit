import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "react-query";
import "@radix-ui/themes/styles.css";
import App from "./App";
import "./index.css";
import { queryClient } from "./app/queryClient";
import { AppThemeProvider } from "./components/Layout/AppThemeProvider";
import { bootstrapAuthFromUrl } from "./features/auth/auth";

// Persiste tokens vindos do callback OAuth e limpa a URL antes do render.
bootstrapAuthFromUrl();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
