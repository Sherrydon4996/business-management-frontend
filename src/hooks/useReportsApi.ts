// src/hooks/useReportsApi.ts

import { useQuery } from "@tanstack/react-query";
import { api } from "@/Apis/axiosApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategorySlice {
  name: string;
  value: number;
}

export interface ChartPoint {
  date: string;
  income: number;
  expenses: number;
}

export interface DebtChartPoint {
  date: string;
  issued: number;
  settled: number;
  outstanding: number;
}

export interface ReportsData {
  // Income / expenses
  monthIncome: number;
  monthExpenses: number;
  netProfit: number;
  savingsRate: number;
  // Debt summary
  debtTotalIssued: number;
  debtTotalSettled: number;
  debtTotalOutstanding: number;
  debtTotalDefaulted: number;
  debtTotalCount: number;
  debtPendingCount: number;
  debtPartialCount: number;
  debtDefaultedCount: number;
  // Charts
  incomeByCat: CategorySlice[];
  expensesByCat: CategorySlice[];
  last30Days: ChartPoint[];
  debtLast30Days: DebtChartPoint[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

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
    refetchInterval: 3 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  return {
    reportsData: data ?? null,
    isLoading,
    error,
    // Income / expenses
    monthIncome: data?.monthIncome ?? 0,
    monthExpenses: data?.monthExpenses ?? 0,
    netProfit: data?.netProfit ?? 0,
    savingsRate: data?.savingsRate ?? 0,
    // Debt
    debtTotalIssued: data?.debtTotalIssued ?? 0,
    debtTotalSettled: data?.debtTotalSettled ?? 0,
    debtTotalOutstanding: data?.debtTotalOutstanding ?? 0,
    debtTotalDefaulted: data?.debtTotalDefaulted ?? 0,
    debtTotalCount: data?.debtTotalCount ?? 0,
    debtPendingCount: data?.debtPendingCount ?? 0,
    debtPartialCount: data?.debtPartialCount ?? 0,
    debtDefaultedCount: data?.debtDefaultedCount ?? 0,
    // Charts
    incomeByCat: data?.incomeByCat ?? [],
    expensesByCat: data?.expensesByCat ?? [],
    last30Days: data?.last30Days ?? [],
    debtLast30Days: data?.debtLast30Days ?? [],
  };
};
