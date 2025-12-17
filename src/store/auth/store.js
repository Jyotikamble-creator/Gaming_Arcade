// Redux store configuration
import { configureStore } from "@reduxjs/toolkit";
// Auth reducer
import authReducer from "@/lib/auth/authSlice";

// Configure and export the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
