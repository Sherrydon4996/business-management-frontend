export type Theme = "light" | "dark";
export type Currency = "KES" | "USD";

export interface Building {
  id: string;
  name: string;
  icon: string;
  type?: string;
  city?: string;
  wifi_installed?: number;
  unitTypes?: BuildingUnitConfig[];
}

export interface BuildingUnitConfig {
  id: string;
  building_id: string;
  unit_type_name: string;
  unit_type_id: string;
  monthly_rent: number;
  created_at?: string;
}

export interface User {
  id: string;
  username: string;
  mobile: string;
  role: string;
  status?: "active" | "suspended";
  created_at: string;
  password?: string;
}

export interface Penalty {
  id: string;
  building_id: string;
  building_name?: string;
  percentage: number;
  created_at: string;
}

export interface SettingsState {
  theme: Theme;
  currency: Currency;
  selectedBuildingId: string | null;
}
