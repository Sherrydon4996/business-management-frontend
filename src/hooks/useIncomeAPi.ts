// src/hooks/useIncomeApi.ts
import { api } from "@/Apis/axiosApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import type {
  Income,
  CreateIncomePayload,
  UpdateIncomePayload,
} from "./../lib/types";

// ─── API Functions ────────────────────────────────────────────────────────────

const fetchIncome = async (): Promise<Income[]> => {
  const res = await api.get<{ success: boolean; records: Income[] }>(
    "/api/v1/income/get",
  );
  return res.data.records || [];
};

const createIncome = async (data: CreateIncomePayload): Promise<Income> => {
  const res = await api.post<{ success: boolean; data: Income }>(
    "/api/v1/admin/income/create",
    data,
  );
  return res.data.data;
};

const updateIncome = async (
  data: { id: string } & UpdateIncomePayload,
): Promise<Income> => {
  const { id, ...payload } = data;
  const res = await api.put<{ success: boolean; data: Income }>(
    `/api/v1/admin/income/update/${id}`,
    payload,
  );
  return res.data.data;
};

const deleteIncome = async (id: string): Promise<string> => {
  await api.delete(`/api/v1/admin/income/delete/${id}`);
  return id;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useIncomeApi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: incomeList = [],
    isLoading: incomeLoading,
    error: incomeError,
  } = useQuery<Income[]>({
    queryKey: ["income"],
    queryFn: fetchIncome,
  });

  const createIncomeMutation = useMutation<Income, any, CreateIncomePayload>({
    mutationFn: createIncome,
    onSuccess: (newEntry) => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      toast({
        title: "Income recorded",
        variant: "success",
        description: `KES ${newEntry.amount.toLocaleString()} from ${newEntry.category}`,
      });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to record income",
        variant: "destructive",
      });
    },
  });

  const updateIncomeMutation = useMutation<
    Income,
    any,
    { id: string } & UpdateIncomePayload
  >({
    mutationFn: updateIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      toast({ title: "Income entry updated", variant: "success" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to update income",
        variant: "destructive",
      });
    },
  });

  const deleteIncomeMutation = useMutation<string, any, string>({
    mutationFn: deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      toast({ title: "Income entry deleted", variant: "success" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to delete income",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    incomeList,
    incomeLoading,
    incomeError,
    // Mutations
    createIncome: createIncomeMutation.mutateAsync,
    updateIncome: updateIncomeMutation.mutateAsync,
    deleteIncome: deleteIncomeMutation.mutateAsync,
    // Pending states
    isCreating: createIncomeMutation.isPending,
    isUpdating: updateIncomeMutation.isPending,
    isDeleting: deleteIncomeMutation.isPending,
  };
};
