// src/hooks/useContributionsApi.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/Apis/axiosApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContributionType =
  | "weekly_group"
  | "cooperative_bank"
  | "caritas_bank"
  | "custom";

export type ContributionStatus = "paid" | "pending" | "overdue";

export interface Contribution {
  id: string;
  amount: number;
  type: ContributionType;
  description: string | null;
  payment_method: string;
  status: ContributionStatus;
  recorded_by: string;
  date: string;
  created_at: string;
}

export interface CreateContributionPayload {
  amount: number;
  type: ContributionType;
  description?: string;
  payment_method: string;
  date: string;
}

export interface UpdateContributionPayload {
  amount?: number;
  type?: ContributionType;
  description?: string;
  payment_method?: string;
  status?: ContributionStatus;
  date?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

const fetchContributions = async (): Promise<Contribution[]> => {
  const res = await api.get<{ success: boolean; records: Contribution[] }>(
    "/api/v1/contributions/get",
  );
  return res.data.records || [];
};

const createContribution = async (
  data: CreateContributionPayload,
): Promise<Contribution> => {
  const res = await api.post<{ success: boolean; data: Contribution }>(
    "/api/v1/admin/contributions/create",
    data,
  );
  return res.data.data;
};

const markPaid = async (payload: {
  id: string;
  date: string;
}): Promise<Contribution> => {
  const res = await api.patch<{ success: boolean; data: Contribution }>(
    `/api/v1/admin/contributions/mark-paid/${payload.id}`,
    { date: payload.date },
  );
  return res.data.data;
};

const updateContribution = async (
  data: { id: string } & UpdateContributionPayload,
): Promise<Contribution> => {
  const { id, ...payload } = data;
  const res = await api.put<{ success: boolean; data: Contribution }>(
    `/api/v1/admin/contributions/update/${id}`,
    payload,
  );
  return res.data.data;
};

const deleteContribution = async (id: string): Promise<string> => {
  await api.delete(`/api/v1/admin/contributions/delete/${id}`);
  return id;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useContributionsApi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: contributionList = [],
    isLoading: contributionsLoading,
    error: contributionsError,
  } = useQuery<Contribution[]>({
    queryKey: ["contributions"],
    queryFn: fetchContributions,
  });

  // ── Create ──────────────────────────────────────────────────────────────────

  const createMutation = useMutation<
    Contribution,
    any,
    CreateContributionPayload
  >({
    mutationFn: createContribution,
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      toast({
        title: "Contribution recorded",
        description: `KES ${entry.amount.toLocaleString()} — ${entry.type.replace(/_/g, " ")}`,
      });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description:
          err?.response?.data?.message || "Failed to record contribution",
        variant: "destructive",
      });
    },
  });

  // ── Mark paid ───────────────────────────────────────────────────────────────

  const markPaidMutation = useMutation<
    Contribution,
    any,
    { id: string; date: string }
  >({
    mutationFn: markPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      toast({ title: "Marked as paid!" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to mark as paid",
        variant: "destructive",
      });
    },
  });

  // ── Update ──────────────────────────────────────────────────────────────────

  const updateMutation = useMutation<
    Contribution,
    any,
    { id: string } & UpdateContributionPayload
  >({
    mutationFn: updateContribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      toast({ title: "Contribution updated" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description:
          err?.response?.data?.message || "Failed to update contribution",
        variant: "destructive",
      });
    },
  });

  // ── Delete ──────────────────────────────────────────────────────────────────

  const deleteMutation = useMutation<string, any, string>({
    mutationFn: deleteContribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      toast({ title: "Contribution deleted" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description:
          err?.response?.data?.message || "Failed to delete contribution",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    contributionList,
    contributionsLoading,
    contributionsError,
    // Mutations
    createContribution: createMutation.mutateAsync,
    markPaid: markPaidMutation.mutateAsync,
    updateContribution: updateMutation.mutateAsync,
    deleteContribution: deleteMutation.mutateAsync,
    // Pending states
    isCreating: createMutation.isPending,
    isMarkingPaid: markPaidMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
