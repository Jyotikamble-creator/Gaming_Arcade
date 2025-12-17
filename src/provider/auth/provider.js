// Provider component for Redux store
"use client";

// This component sets up the Redux store, React Query client, and theme context for the application.
import React, { useEffect } from "react";
// Redux provider
import { Provider } from "react-redux";
// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Redux store and auth actions
import { store } from "@/lib/store";
// Auth actions
import { fetchCurrentUser, setToken } from "@/lib/auth/authSlice";
// Axios client
import { setAuthToken } from "@/lib/axios/apiClient";
// Theme context
import { ThemeProvider } from "@/lib/theme/ThemeContext";

const queryClient = new QueryClient();

// Providers component
export default function Providers({ children }) {
  useEffect(() => {
    // If token and userId exist in localStorage, attempt to fetch current user
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;

      if (token && userId) {
        // Set token in axios client and Redux store
        setAuthToken(token);
        store.dispatch(setToken(token));
        // dispatch fetchCurrentUser to populate user
        store.dispatch(fetchCurrentUser());
      }
    } catch {
      // ignore
    }
  }, []);

  // Render providers
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}
