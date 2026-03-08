import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/slices/authSlice";

import settingsQReducer from "@/slices/settingsQuerySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,

    settingsQ: settingsQReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
