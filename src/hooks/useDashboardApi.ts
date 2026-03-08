// src/hooks/useDashboardApi.ts

import { useQuery } from "@tanstack/react-query";
import { api } from "@/Apis/axiosApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChartPoint {
  date: string;
  income: number;
  expenses: number;
}

export interface CategorySlice {
  name: string;
  value: number;
}

export interface WeekBar {
  week: string;
  income: number;
  expenses: number;
}

export interface RecentTransaction {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface DashboardStats {
  // Today
  todayIncome: number;
  todayExpenses: number;
  todayProfit: number;
  // Week
  weekIncome: number;
  weekExpenses: number;
  weekProfit: number;
  // Month
  monthIncome: number;
  monthExpenses: number;
  monthProfit: number;
  // Year
  yearIncome: number;
  yearExpenses: number;
  yearProfit: number;
  // Charts
  last30Days: ChartPoint[];
  incomeByCat: CategorySlice[];
  expensesByCat: CategorySlice[];
  weeklyComparison: WeekBar[];
  // Table
  recentTransactions: RecentTransaction[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get<{ success: boolean; data: DashboardStats }>(
    "/api/v1/dashboard/stats/get",
  );
  return res.data.data;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useDashboardApi = () => {
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 3 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  return { stats: data ?? null, isLoading, error };
};
