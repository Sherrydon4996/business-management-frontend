// src/hooks/usePsGamesApi.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/Apis/axiosApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PsGame {
  id: string;
  name: string;
  platform: string;
  price_per_hour: number;
  minutes_per_game: number;
  available: 0 | 1; // SQLite INTEGER
  date_added: string;
  created_at: string;
}

export interface Session {
  id: string;
  customer_name: string;
  game_name: string;
  num_games: number;
  amount: number;
  start_time: string; // "HH:MM" 24-hour EAT
  end_time: string; // "HH:MM" 24-hour EAT
  status: "active" | "done";
  date_key: string; // YYYY-MM-DD
  created_at: string;
}

export interface CreateGamePayload {
  name: string;
  platform?: string;
  price_per_hour: number;
  minutes_per_game: number;
}

export interface UpdateGamePayload {
  id: string;
  name?: string;
  platform?: string;
  price_per_hour?: number;
  minutes_per_game?: number;
}

export interface CreateSessionPayload {
  customer_name: string;
  game_name: string;
  num_games: number;
  amount: number;
  total_minutes: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

const fetchGames = async (): Promise<PsGame[]> => {
  const res = await api.get<{ success: boolean; records: PsGame[] }>(
    "/api/v1/ps-games/get",
  );
  return res.data.records || [];
};

const createGame = async (data: CreateGamePayload): Promise<PsGame> => {
  const res = await api.post<{ success: boolean; data: PsGame }>(
    "/api/v1/admin/ps-games/create",
    data,
  );
  return res.data.data;
};

const updateGame = async ({
  id,
  ...data
}: UpdateGamePayload): Promise<PsGame> => {
  const res = await api.put<{ success: boolean; data: PsGame }>(
    `/api/v1/admin/ps-games/update/${id}`,
    data,
  );
  return res.data.data;
};

const toggleAvailability = async (id: string): Promise<PsGame> => {
  const res = await api.patch<{ success: boolean; data: PsGame }>(
    `/api/v1/admin/ps-games/availability/${id}`,
  );
  return res.data.data;
};

const deleteGame = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/admin/ps-games/delete/${id}`);
};

const fetchSessions = async (): Promise<Session[]> => {
  const res = await api.get<{ success: boolean; records: Session[] }>(
    "/api/v1/ps-games/sessions/get",
  );
  return res.data.records || [];
};

const createSession = async (data: CreateSessionPayload): Promise<Session> => {
  const res = await api.post<{ success: boolean; data: Session }>(
    "/api/v1/admin/ps-games/sessions/create",
    data,
  );
  return res.data.data;
};

const markSessionDone = async (id: string): Promise<Session> => {
  const res = await api.patch<{ success: boolean; data: Session }>(
    `/api/v1/admin/ps-games/sessions/done/${id}`,
  );
  return res.data.data;
};

const deleteSession = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/admin/ps-games/sessions/delete/${id}`);
};

// ─── PS Games Hook ────────────────────────────────────────────────────────────

export const usePsGamesApi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: gameList = [], isLoading: gamesLoading } = useQuery<PsGame[]>({
    queryKey: ["ps-games"],
    queryFn: fetchGames,
  });

  const createMutation = useMutation<PsGame, any, CreateGamePayload>({
    mutationFn: createGame,
    onSuccess: (g) => {
      queryClient.invalidateQueries({ queryKey: ["ps-games"] });
      toast({ title: "Game added", description: g.name });
    },
    onError: (err) =>
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed",
        variant: "destructive",
      }),
  });

  const updateMutation = useMutation<PsGame, any, UpdateGamePayload>({
    mutationFn: updateGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ps-games"] });
      toast({ title: "Game updated" });
    },
    onError: (err) =>
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed",
        variant: "destructive",
      }),
  });

  const toggleMutation = useMutation<PsGame, any, string>({
    mutationFn: toggleAvailability,
    onSuccess: (g) => {
      queryClient.invalidateQueries({ queryKey: ["ps-games"] });
      toast({ title: `Marked ${g.available ? "available" : "unavailable"}` });
    },
    onError: (err) =>
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed",
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation<void, any, string>({
    mutationFn: deleteGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ps-games"] });
      toast({ title: "Game deleted" });
    },
    onError: (err) =>
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed",
        variant: "destructive",
      }),
  });

  return {
    gameList,
    gamesLoading,
    createGame: createMutation.mutateAsync,
    updateGame: updateMutation.mutateAsync,
    toggleAvailability: toggleMutation.mutateAsync,
    deleteGame: deleteMutation.mutateAsync,
    isCreatingGame: createMutation.isPending,
    isUpdatingGame: updateMutation.isPending,
    isTogglingGame: toggleMutation.isPending,
    isDeletingGame: deleteMutation.isPending,
  };
};

// ─── Sessions Hook ────────────────────────────────────────────────────────────

export const useSessionsApi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sessionList = [], isLoading: sessionsLoading } = useQuery<
    Session[]
  >({
    queryKey: ["ps-sessions"],
    queryFn: fetchSessions,
    // Refetch every 30s so auto-done sessions surface quickly
    refetchInterval: 30 * 1000,
  });

  const createMutation = useMutation<Session, any, CreateSessionPayload>({
    mutationFn: createSession,
    onSuccess: (s) => {
      queryClient.invalidateQueries({ queryKey: ["ps-sessions"] });
      toast({
        title: "Session started!",
        description: `${s.game_name} — ${s.end_time} EAT`,
      });
    },
    onError: (err) =>
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed",
        variant: "destructive",
      }),
  });

  const doneMutation = useMutation<Session, any, string>({
    mutationFn: markSessionDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ps-sessions"] });
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
      queryClient.invalidateQueries({ queryKey: ["ps-sessions"] });
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
    sessionsLoading,
    createSession: createMutation.mutateAsync,
    markSessionDone: doneMutation.mutateAsync,
    deleteSession: deleteMutation.mutateAsync,
    isCreatingSession: createMutation.isPending,
    isMarkingDone: doneMutation.isPending,
    isDeletingSession: deleteMutation.isPending,
  };
};
