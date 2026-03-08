// src/hooks/useCyberServicesApi.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/Apis/axiosApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CyberService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  date_added: string; // ISO 8601 +03:00
  created_at: string;
}

export interface CreateCyberServicePayload {
  name: string;
  description?: string;
  price: number;
}

export interface UpdateCyberServicePayload {
  id: string;
  name?: string;
  description?: string;
  price?: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

const fetchServices = async (): Promise<CyberService[]> => {
  const res = await api.get<{ success: boolean; records: CyberService[] }>(
    "/api/v1/cyber-services/get",
  );
  return res.data.records || [];
};

const createService = async (
  data: CreateCyberServicePayload,
): Promise<CyberService> => {
  const res = await api.post<{ success: boolean; data: CyberService }>(
    "/api/v1/admin/cyber-services/create",
    data,
  );
  return res.data.data;
};

const updateService = async ({
  id,
  ...data
}: UpdateCyberServicePayload): Promise<CyberService> => {
  const res = await api.put<{ success: boolean; data: CyberService }>(
    `/api/v1/admin/cyber-services/update/${id}`,
    data,
  );
  return res.data.data;
};

const deleteService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/admin/cyber-services/delete/${id}`);
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCyberServicesApi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: serviceList = [],
    isLoading,
    error,
  } = useQuery<CyberService[]>({
    queryKey: ["cyber-services"],
    queryFn: fetchServices,
  });

  const createMutation = useMutation<
    CyberService,
    any,
    CreateCyberServicePayload
  >({
    mutationFn: createService,
    onSuccess: (s) => {
      queryClient.invalidateQueries({ queryKey: ["cyber-services"] });
      toast({ title: "Service added", description: s.name });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to add service",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation<
    CyberService,
    any,
    UpdateCyberServicePayload
  >({
    mutationFn: updateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cyber-services"] });
      toast({ title: "Service updated" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to update service",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation<void, any, string>({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cyber-services"] });
      toast({ title: "Service deleted" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to delete service",
        variant: "destructive",
      });
    },
  });

  return {
    serviceList,
    isLoading,
    error,
    createService: createMutation.mutateAsync,
    updateService: updateMutation.mutateAsync,
    deleteService: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
