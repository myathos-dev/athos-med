import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import App from "./App.jsx";
import { setCurrentUser } from "./lib/user.js";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

async function boot() {
  // Load the signed-in user before the first render, because the blocks
  // read window.logged_in_user synchronously to decide admin access.
  try {
    const res = await fetch("/api/me");
    if (res.ok) {
      const me = await res.json();
      setCurrentUser(me);
      window.logged_in_user = { Role: { label: me.role } };
    }
  } catch {
    setCurrentUser(null);
  }

  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="bottom-right" richColors />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

boot();
