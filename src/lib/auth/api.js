// API functions for authentication
import { apiClient, setAuthToken } from "@/lib/axios/apiClient";
// Error handling
import { categorizeAxiosError } from "@/lib/errors";

// Signup a new user
export async function signup(data) {
  try {
    const response = await apiClient.post("/v1/auth/signup", data);
    console.log("Signup response:", response.data);
    return response.data;
  } catch (err) {
    throw categorizeAxiosError(err);
  }
}

// Login a user
export function login(userId) {
  try {
    const token = `user_authenticated_${userId}`;
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId.toString());
    setAuthToken(token);
  } catch (err) {
    console.error("Error in setting token in local storage", err);
  }
}

// Login API call
export async function loginApi(credentials) {
  try {
    const res = await apiClient.post("/v1/auth/login", credentials);
    console.log("Login response:", res.data);
    return res.data;
  } catch (err) {
    throw categorizeAxiosError(err);
  }
}

// Get current user
export async function me() {
  try {
    const res = await apiClient.get("/v1/auth/me");
    return res.data;
  } catch (err) {
    throw categorizeAxiosError(err);
  }
}

// Change password
export async function changePassword(data) {
  try {
    const res = await apiClient.post("/v1/auth/change-password", data);
    return res.data;
  } catch (err) {
    throw categorizeAxiosError(err);
  }
}

// Get user settings
export async function getUserSettings() {
  try {
    const res = await apiClient.get("/v1/auth/settings");
    return res.data;
  } catch (err) {
    throw categorizeAxiosError(err);
  }
}


// Logout user
export function logout() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setAuthToken(undefined);
  } catch (err) {
    console.error("Error while removing token", err);
  }
}
