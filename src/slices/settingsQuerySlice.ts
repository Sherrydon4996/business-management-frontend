import { Currency, SettingsState, Theme } from "@/pages/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: SettingsState = {
  theme: (localStorage.getItem("smartrent_theme") as Theme) || "light",
  currency: (localStorage.getItem("smartrent-currency") as Currency) || "KES",
  selectedBuildingId: null,
};

// ── Slice ───────────────────────────────────────────────────────────────────
const settingsSlice = createSlice({
  name: "settingsQ",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("smartrent_theme", state.theme);
      document.documentElement.classList.toggle("dark");
    },

    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem("smartrent_theme", action.payload);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(action.payload);
    },

    setCurrency: (state, action: PayloadAction<Currency>) => {
      state.currency = action.payload;
      localStorage.setItem("smartrent-currency", action.payload);
    },

    setSelectedBuilding: (state, action: PayloadAction<string | null>) => {
      state.selectedBuildingId = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, setCurrency, setSelectedBuilding } =
  settingsSlice.actions;

export default settingsSlice.reducer;
