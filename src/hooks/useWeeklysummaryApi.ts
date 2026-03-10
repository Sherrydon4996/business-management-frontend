// src/hooks/useWeeklySummaryApi.ts

import { useQuery } from "@tanstack/react-query";
import { api } from "@/Apis/axiosApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WeekData {
  weekNumber: number;
  weekLabel: string;
  startKey: string; // YYYY-MM-DD
  endKey: string; // YYYY-MM-DD
  earnings: number;
  contributions: number;
  expenses: number;
  savings: number;
}

export interface PeriodTotals {
  month?: number; // 0-based, only on monthlyTotals
  year: number;
  earnings: number;
  contributions: number;
  expenses: number;
  savings: number;
  debtOutstanding: number;
}

export interface WeeklySummaryData {
  selectedMonth: number;
  selectedYear: number;
  weeks: WeekData[];
  monthlyTotals: PeriodTotals;
  yearlyTotals: PeriodTotals;
}

// ─── API Function ─────────────────────────────────────────────────────────────

const fetchWeeklySummary = async (
  month: number,
  year: number,
): Promise<WeeklySummaryData> => {
  const res = await api.get<{ success: boolean; data: WeeklySummaryData }>(
    `/api/v1/weekly-summary/get`,
    { params: { month, year } },
  );
  return res.data.data;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useWeeklySummaryApi = (month: number, year: number) => {
  const { data, isLoading, error } = useQuery<WeeklySummaryData>({
    queryKey: ["weekly-summary", month, year],
    queryFn: () => fetchWeeklySummary(month, year),
    // Keep previous month's data visible while loading new month
    placeholderData: (prev) => prev,
  });

  return {
    summaryData: data ?? null,
    weeks: data?.weeks ?? [],
    monthlyTotals: data?.monthlyTotals ?? null,
    yearlyTotals: data?.yearlyTotals ?? null,
    isLoading,
    error,
  };
};
