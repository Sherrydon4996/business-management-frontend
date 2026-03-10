// src/hooks/useDashboardApi.ts

import { useQuery } from "@tanstack/react-query";
import { api } from "@/Apis/axiosApi";

export interface ChartPoint {
  date: string;
  income: number;
  expenses: number;
  debtOutstanding: number; // ← new: per-day outstanding debt balance
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
  todayIncome: number;
  todayExpenses: number;
  todayProfit: number;
  todayDebtOutstanding: number;
  weekIncome: number;
  weekExpenses: number;
  weekProfit: number;
  weekDebtOutstanding: number;
  monthIncome: number;
  monthExpenses: number;
  monthProfit: number;
  monthDebtOutstanding: number;
  yearIncome: number;
  yearExpenses: number;
  yearProfit: number;
  yearDebtOutstanding: number;
  last30Days: ChartPoint[];
  incomeByCat: CategorySlice[];
  expensesByCat: CategorySlice[];
  weeklyComparison: WeekBar[];
  recentTransactions: RecentTransaction[];
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get<{ success: boolean; data: DashboardStats }>(
    "/api/v1/dashboard/stats/get",
  );
  return res.data.data;
};

export const useDashboardApi = () => {
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 3 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
  return { stats: data ?? null, isLoading, error };
};
