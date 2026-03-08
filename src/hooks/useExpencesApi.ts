// src/hooks/useExpensesApi.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type {
  Expense,
  CreateExpensePayload,
  UpdateExpensePayload,
} from "@/lib/types";
import { api } from "@/Apis/axiosApi";

// ─── API Functions ────────────────────────────────────────────────────────────

const fetchExpenses = async (): Promise<Expense[]> => {
  const res = await api.get<{ success: boolean; records: Expense[] }>(
    "/api/v1/expenses/get",
  );
  return res.data.records || [];
};

const createExpense = async (data: CreateExpensePayload): Promise<Expense> => {
  const res = await api.post<{ success: boolean; data: Expense }>(
    "/api/v1/admin/expenses/create",
    data,
  );
  return res.data.data;
};

const updateExpense = async (
  data: { id: string } & UpdateExpensePayload,
): Promise<Expense> => {
  const { id, ...payload } = data;
  const res = await api.put<{ success: boolean; data: Expense }>(
    `/api/v1/admin/expenses/update/${id}`,
    payload,
  );
  return res.data.data;
};

const deleteExpense = async (id: string): Promise<string> => {
  await api.delete(`/api/v1/admin/expenses/delete/${id}`);
  return id;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useExpensesApi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: expenseList = [],
    isLoading: expensesLoading,
    error: expensesError,
  } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  const createExpenseMutation = useMutation<Expense, any, CreateExpensePayload>(
    {
      mutationFn: createExpense,
      onSuccess: (entry) => {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        toast({
          title: "Expense recorded",
          variant: "success",
          description: `KES ${entry.amount.toLocaleString()} for ${entry.category}`,
        });
      },
      onError: (err) => {
        toast({
          title: err?.response?.data?.code ?? "Error",
          description:
            err?.response?.data?.message || "Failed to record expense",
          variant: "destructive",
        });
      },
    },
  );

  const updateExpenseMutation = useMutation<
    Expense,
    any,
    { id: string } & UpdateExpensePayload
  >({
    mutationFn: updateExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Expense updated", variant: "success" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to update expense",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation<string, any, string>({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Expense deleted", variant: "success" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    expenseList,
    expensesLoading,
    expensesError,
    // Mutations
    createExpense: createExpenseMutation.mutateAsync,
    updateExpense: updateExpenseMutation.mutateAsync,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    // Pending states
    isCreating: createExpenseMutation.isPending,
    isUpdating: updateExpenseMutation.isPending,
    isDeleting: deleteExpenseMutation.isPending,
  };
};
