// src/hooks/useReportsApi.ts

import { useQuery } from "@tanstack/react-query";
import { api } from "@/Apis/axiosApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategorySlice {
  name: string;
  value: number;
}

export interface ChartPoint {
  date: string; // "Mar 04"
  income: number;
  expenses: number;
}

export interface ReportsData {
  monthIncome: number;
  monthExpenses: number;
  netProfit: number;
  savingsRate: number; // e.g. 34.5  (percent, one decimal)
  incomeByCat: CategorySlice[];
  expensesByCat: CategorySlice[];
  last30Days: ChartPoint[];
}

// ─── API Function ─────────────────────────────────────────────────────────────

const fetchReports = async (): Promise<ReportsData> => {
  const res = await api.get<{ success: boolean; data: ReportsData }>(
    "/api/v1/reports/get",
  );
  return res.data.data;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useReportsApi = () => {
  const { data, isLoading, error } = useQuery<ReportsData>({
    queryKey: ["reports"],
    queryFn: fetchReports,
    // Refresh every 3 minutes — charts stay reasonably fresh during the day
    refetchInterval: 3 * 60 * 1000,
    // Keep stale data visible while re-fetching (no blank flash on charts)
    placeholderData: (prev) => prev,
  });

  return {
    reportsData: data ?? null,
    monthIncome: data?.monthIncome ?? 0,
    monthExpenses: data?.monthExpenses ?? 0,
    netProfit: data?.netProfit ?? 0,
    savingsRate: data?.savingsRate ?? 0,
    incomeByCat: data?.incomeByCat ?? [],
    expensesByCat: data?.expensesByCat ?? [],
    last30Days: data?.last30Days ?? [],
    isLoading,
    error,
  };
};
