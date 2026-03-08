// src/hooks/useComputerSessionsApi.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/Apis/axiosApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComputerSession {
  id: string;
  customer_name: string;
  computer_number: number;
  amount: number; // KES paid = minutes
  minutes: number; // duration (same value as amount)
  start_time: string; // "HH:MM" 24-hour EAT
  end_time: string; // "HH:MM" 24-hour EAT
  status: "active" | "done";
  date_key: string; // YYYY-MM-DD
  created_at: string;
}

export interface CreateComputerSessionPayload {
  customer_name: string;
  computer_number: number;
  amount: number; // 1 KES = 1 minute
}

// ─── API Functions ────────────────────────────────────────────────────────────

const fetchSessions = async (): Promise<ComputerSession[]> => {
  const res = await api.get<{ success: boolean; records: ComputerSession[] }>(
    "/api/v1/computer-sessions/get",
  );
  return res.data.records || [];
};

const createSession = async (
  data: CreateComputerSessionPayload,
): Promise<ComputerSession> => {
  const res = await api.post<{ success: boolean; data: ComputerSession }>(
    "/api/v1/admin/computer-sessions/create",
    data,
  );
  return res.data.data;
};

const markDone = async (id: string): Promise<ComputerSession> => {
  const res = await api.patch<{ success: boolean; data: ComputerSession }>(
    `/api/v1/admin/computer-sessions/done/${id}`,
  );
  return res.data.data;
};

const deleteSession = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/admin/computer-sessions/delete/${id}`);
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useComputerSessionsApi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sessionList = [], isLoading } = useQuery<ComputerSession[]>({
    queryKey: ["computer-sessions"],
    queryFn: fetchSessions,
    // Refetch every 30s so auto-done sessions surface without manual refresh
    refetchInterval: 30 * 1000,
  });

  const createMutation = useMutation<
    ComputerSession,
    any,
    CreateComputerSessionPayload
  >({
    mutationFn: createSession,
    onSuccess: (s) => {
      queryClient.invalidateQueries({ queryKey: ["computer-sessions"] });
      toast({
        title: "Session started!",
        description: `${s.minutes} min (KES ${s.amount}) — ends at ${formatHHMM(s.end_time)}`,
      });
    },
    onError: (err) =>
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to start session",
        variant: "destructive",
      }),
  });

  const doneMutation = useMutation<ComputerSession, any, string>({
    mutationFn: markDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["computer-sessions"] });
      toast({ title: "Session marked done" });
    },
    onError: (err) =>
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed",
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation<void, any, string>({
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["computer-sessions"] });
      toast({ title: "Session removed" });
    },
    onError: (err) =>
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed",
        variant: "destructive",
      }),
  });

  return {
    sessionList,
    isLoading,
    createSession: createMutation.mutateAsync,
    markDone: doneMutation.mutateAsync,
    deleteSession: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isMarkingDone: doneMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

// ─── Util (used in hook toast) ────────────────────────────────────────────────

function formatHHMM(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}
