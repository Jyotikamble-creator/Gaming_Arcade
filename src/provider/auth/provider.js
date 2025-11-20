"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/lib/store";
import { fetchCurrentUser, setToken } from "@/lib/auth/authSlice";
import { setAuthToken } from "@/lib/axios/apiClient";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

const queryClient = new QueryClient();

export default function Providers({ children }) {
  useEffect(() => {
    // If token and userId exist in localStorage, attempt to fetch current user
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      
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

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}