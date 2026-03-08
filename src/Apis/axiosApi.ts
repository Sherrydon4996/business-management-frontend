import { logoutAction, setCredentials } from "@/slices/authSlice";
import { store } from "@/store/store";
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add access token to all requests
api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle 401 errors and session expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Check if this is an intentional logout
    const isIntentionalLogout = (api as any)._isIntentionalLogout;

    // Prevent refresh loop on auth endpoints
    if (
      originalRequest.url?.includes("/api/v1/auth/login") ||
      originalRequest.url?.includes("/api/v1/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // ✅ If logging out intentionally, don't show session expired message
    if (isIntentionalLogout) {
      return Promise.reject(error);
    }

    // ✅ Check if it's a session expiry error
    const errorMessage = error.response?.data?.message || "";
    if (
      error.response?.status === 401 &&
      (errorMessage.toLowerCase().includes("session expired") ||
        errorMessage.toLowerCase().includes("session has expired"))
    ) {
      // console.log("🔴 Session expired - logging out");
      store.dispatch(logoutAction());
      window.location.href = "/";
      return Promise.reject(error);
    }

    // Handle regular 401 (access token expired, but session still valid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          "http://localhost:5000/api/v1/auth/refresh",
          {},
          { withCredentials: true },
        );

        const { accessToken, user } = res.data;
        const state = store.getState();
        const currentUser = user || state.auth.user;

        store.dispatch(
          setCredentials({
            accessToken,
            user: currentUser,
          }),
        );

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError: any) {
        // ✅ Don't show error if intentional logout
        if (isIntentionalLogout) {
          return Promise.reject(refreshError);
        }

        // ✅ Check if refresh failed due to session expiry
        const refreshErrorMessage = refreshError.response?.data?.message || "";
        if (
          refreshErrorMessage.toLowerCase().includes("session expired") ||
          refreshErrorMessage.toLowerCase().includes("session has expired")
        ) {
          // console.log("🔴 Session expired during refresh - logging out");
        } else {
          // console.log("🔴 Refresh token failed - logging out");
        }

        store.dispatch(logoutAction());
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
