// src/hooks/useMoviesInventoryApi.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/Apis/axiosApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaItem {
  id: string;
  title: string;
  genre: string;
  year: string;
  type: "movie" | "series";
  seasons: number | null;
  date_added: string; // ISO 8601 +03:00
  created_at: string;
}

export interface CreateMediaPayload {
  title: string;
  genre: string;
  year: string;
  type: "movie" | "series";
  seasons?: number;
}

export interface UpdateMediaPayload {
  id: string;
  title?: string;
  genre?: string;
  year?: string;
  seasons?: number | null;
}

// ─── API Functions ────────────────────────────────────────────────────────────

const fetchInventory = async (): Promise<MediaItem[]> => {
  const res = await api.get<{ success: boolean; records: MediaItem[] }>(
    "/api/v1/movies-inventory/get",
  );
  return res.data.records || [];
};

const createItem = async (data: CreateMediaPayload): Promise<MediaItem> => {
  const res = await api.post<{ success: boolean; data: MediaItem }>(
    "/api/v1/admin/movies-inventory/create",
    data,
  );
  return res.data.data;
};

const updateItem = async ({
  id,
  ...data
}: UpdateMediaPayload): Promise<MediaItem> => {
  const res = await api.put<{ success: boolean; data: MediaItem }>(
    `/api/v1/admin/movies-inventory/update/${id}`,
    data,
  );
  return res.data.data;
};

const deleteItem = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/admin/movies-inventory/delete/${id}`);
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useMoviesInventoryApi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: inventoryList = [],
    isLoading,
    error,
  } = useQuery<MediaItem[]>({
    queryKey: ["movies-inventory"],
    queryFn: fetchInventory,
  });

  const createMutation = useMutation<MediaItem, any, CreateMediaPayload>({
    mutationFn: createItem,
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ["movies-inventory"] });
      toast({
        title: `${item.type === "movie" ? "Movie" : "Series"} added`,
        description: item.title,
      });
    },
    onError: (err) =>
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to add item",
        variant: "destructive",
      }),
  });

  const updateMutation = useMutation<MediaItem, any, UpdateMediaPayload>({
    mutationFn: updateItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies-inventory"] });
      toast({ title: "Updated successfully" });
    },
    onError: (err) =>
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to update item",
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation<void, any, string>({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies-inventory"] });
      toast({ title: "Deleted" });
    },
    onError: (err) =>
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to delete item",
        variant: "destructive",
      }),
  });

  return {
    inventoryList,
    isLoading,
    error,
    createItem: createMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    deleteItem: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
