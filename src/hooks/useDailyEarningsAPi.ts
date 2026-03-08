// src/hooks/useDailyEarningsApi.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/Apis/axiosApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyEarningRow {
  date_key: string; // YYYY-MM-DD (Kenyan date)
  ps_gaming: number;
  cyber_services: number;
  movie_rentals: number;
  other_income: number;
  total_income: number;
  total_expenses: number;
  net_total: number; // total_income - total_expenses
}

// ─── API Function ─────────────────────────────────────────────────────────────

const fetchDailyEarnings = async (): Promise<DailyEarningRow[]> => {
  const res = await api.get<{ success: boolean; records: DailyEarningRow[] }>(
    "/api/v1/daily-earnings/get",
  );
  return res.data.records || [];
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useDailyEarningsApi = () => {
  const {
    data: dailyRows = [],
    isLoading,
    error,
  } = useQuery<DailyEarningRow[]>({
    queryKey: ["daily-earnings"],
    queryFn: fetchDailyEarnings,
    // Refresh every 2 minutes so the table stays current during the workday
    refetchInterval: 2 * 60 * 1000,
  });

  return { dailyRows, isLoading, error };
};
