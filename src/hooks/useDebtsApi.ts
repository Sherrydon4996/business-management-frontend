// src/hooks/useDebtsApi.ts

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/Apis/axiosApi";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DebtStatus = "pending" | "partial" | "settled" | "defaulted";
export type IncomeCategory = "PS Gaming" | "Cyber Services" | "Movie Rentals";

export interface Debt {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  amount: number;
  amount_settled: number;
  balance: number;
  income_category: IncomeCategory;
  description: string | null;
  payment_method: string;
  status: DebtStatus;
  date: string;
  settled_at: string | null;
  created_at: string;
  recorded_by: string;
}

export interface DebtSummary {
  total_owed: number;
  total_collected: number;
  total_outstanding: number;
  total_count: number;
  pending_count: number;
  partial_count: number;
  settled_count: number;
  defaulted_count: number;
}

export interface CreateDebtPayload {
  customer_name: string;
  customer_phone?: string;
  amount: number;
  income_category: IncomeCategory;
  description?: string;
  payment_method: string;
  date?: string;
}

export interface UpdateDebtPayload {
  customer_name?: string;
  customer_phone?: string;
  amount?: number;
  income_category?: IncomeCategory;
  description?: string;
  payment_method?: string;
  date?: string;
}

export interface SettlePayload {
  settle_amount?: number;
  settle_all?: boolean;
}

// ─── API functions ────────────────────────────────────────────────────────────

const fetchDebts = async (params: Record<string, string>) => {
  const q = new URLSearchParams(params).toString();
  const res = await api.get<{
    success: boolean;
    data: Debt[];
    summary: DebtSummary;
  }>(`/api/v1/debts/get${q ? `?${q}` : ""}`);
  return res.data;
};

const postDebt = async (payload: CreateDebtPayload) => {
  const res = await api.post<{ success: boolean; data: Debt }>(
    "/api/v1/admin/debts/create",
    payload,
  );
  return res.data.data;
};

const putDebt = async ({
  id,
  ...payload
}: UpdateDebtPayload & { id: string }) => {
  const res = await api.put<{ success: boolean; data: Debt }>(
    `/api/v1/admin/debts/update/${id}`,
    payload,
  );
  return res.data.data;
};

const removeDebt = async (id: string) => {
  await api.delete(`/api/v1/admin/debts/delete/${id}`);
};

const patchSettle = async ({
  id,
  ...payload
}: SettlePayload & { id: string }) => {
  const res = await api.patch<{ success: boolean; data: Debt }>(
    `/api/v1/admin/debts/settle/${id}`,
    payload,
  );
  return res.data.data;
};

const patchDefault = async (id: string) => {
  const res = await api.patch<{ success: boolean; data: Debt }>(
    `/api/v1/admin/debts/default/${id}`,
  );
  return res.data.data;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useDebtsApi = (filters: Record<string, string> = {}) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const QK = ["debts", filters];

  const invalidate = () => qc.invalidateQueries({ queryKey: ["debts"] });

  // ── Query ──────────────────────────────────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: QK,
    queryFn: () => fetchDebts(filters),
    placeholderData: (prev) => prev,
  });

  // ── Per-row loading state ──────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [defaultingId, setDefaultingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // ── Create ─────────────────────────────────────────────────────────────────
  const createMut = useMutation({
    mutationFn: postDebt,
    onSuccess: () => {
      toast({ title: "Debt recorded ✓" });
      invalidate();
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.data?.message ?? "Failed to create debt",
        variant: "destructive",
      }),
  });

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateMut = useMutation({
    mutationFn: (args: UpdateDebtPayload & { id: string }) => {
      setSavingId(args.id);
      return putDebt(args);
    },
    onSuccess: () => {
      toast({ title: "Debt updated ✓" });
      invalidate();
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.data?.message ?? "Failed to update",
        variant: "destructive",
      }),
    onSettled: () => setSavingId(null),
  });

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteMut = useMutation({
    mutationFn: (id: string) => {
      setDeletingId(id);
      return removeDebt(id);
    },
    onSuccess: () => {
      toast({ title: "Debt deleted" });
      invalidate();
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.data?.message ?? "Failed to delete",
        variant: "destructive",
      }),
    onSettled: () => setDeletingId(null),
  });

  // ── Settle ─────────────────────────────────────────────────────────────────
  const settleMut = useMutation({
    mutationFn: (args: SettlePayload & { id: string }) => {
      setSettlingId(args.id);
      return patchSettle(args);
    },
    onSuccess: (data) => {
      toast({
        title: "Payment recorded ✓",
        description: `Income posted to ${data.income_category}`,
      });
      invalidate();
      // Also refresh income queries so Income page reflects the new entry
      qc.invalidateQueries({ queryKey: ["income"] });
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.data?.message ?? "Failed to settle",
        variant: "destructive",
      }),
    onSettled: () => setSettlingId(null),
  });

  // ── Toggle default ─────────────────────────────────────────────────────────
  const defaultMut = useMutation({
    mutationFn: (id: string) => {
      setDefaultingId(id);
      return patchDefault(id);
    },
    onSuccess: (data) => {
      const isNowDefaulted = data.status === "defaulted";
      toast({
        title: isNowDefaulted ? "Marked as bad debt ⚠️" : "Default removed ✓",
        variant: isNowDefaulted ? "destructive" : "default",
      });
      invalidate();
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e?.response?.data?.message ?? "Failed",
        variant: "destructive",
      }),
    onSettled: () => setDefaultingId(null),
  });

  return {
    debts: data?.data ?? [],
    summary: data?.summary ?? ({} as DebtSummary),
    isLoading,
    error,

    deletingId,
    settlingId,
    defaultingId,
    savingId,

    createDebt: createMut.mutate,
    isCreating: createMut.isPending,
    updateDebt: updateMut.mutate,
    deleteDebt: deleteMut.mutate,
    settleDebt: settleMut.mutate,
    toggleDefault: defaultMut.mutate,
  };
};
