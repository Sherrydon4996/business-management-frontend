// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Mirrors the SELECT fields returned by the server on login / refresh:
// id, username, mobile, role, status

// src/pages/settingsQ/types.ts

// Matches the users table schema and what the API returns:
// id, username, mobile, role, status, created_at
export interface User {
  id: string;
  username: string;
  mobile: string;
  password?: string; // only sent on create, never returned
  role: "admin" | "user";
  status: "active" | "suspended";
  created_at?: string;
}
export interface AuthUser {
  id: string;
  username: string;
  mobile: string;
  role: string;
  status: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isLoggingOut: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        user: AuthUser;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    logoutAction: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoggingOut = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoggingOut: (state, action: PayloadAction<boolean>) => {
      state.isLoggingOut = action.payload;
    },
  },
});

export const { setCredentials, logoutAction, setLoading, setLoggingOut } =
  authSlice.actions;
export default authSlice.reducer;
