// src/hooks/useSettingsApi.ts
import { api } from "@/Apis/axiosApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/slices/authSlice";

// ─── API Functions ────────────────────────────────────────────────────────────

const fetchUsers = async (): Promise<User[]> => {
  const res = await api.get<{ success: boolean; records: User[] }>(
    "/api/v1/admin/users/fetchAll",
  );
  return res.data.records || [];
};

const addUser = async (
  data: Pick<User, "username" | "mobile" | "role"> & { password: string },
): Promise<User> => {
  const res = await api.post<{ success: boolean; data: User }>(
    "/api/v1/admin/users/create",
    data,
  );
  return res.data.data;
};

const updateUser = async (
  data: { id: string } & Partial<Omit<User, "id">>,
): Promise<User> => {
  const { id, ...payload } = data;
  const res = await api.put<{ success: boolean; data: User }>(
    `/api/v1/admin/users/update/${id}`,
    payload,
  );
  return res.data.data;
};

const deleteUser = async (id: string): Promise<string> => {
  await api.delete(`/api/v1/admin/users/delete/${id}`);
  return id;
};

const suspendUser = async (id: string): Promise<User> => {
  const res = await api.put<{ success: boolean; data: User }>(
    `/api/v1/admin/users/${id}/suspend`,
  );
  return res.data.data;
};

const unsuspendUser = async (id: string): Promise<User> => {
  const res = await api.put<{ success: boolean; data: User }>(
    `/api/v1/admin/users/${id}/unsuspend`,
  );
  return res.data.data;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useSettingsApi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const addUserMutation = useMutation<
    User,
    any,
    Pick<User, "username" | "mobile" | "role"> & { password: string }
  >({
    mutationFn: addUser,
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "User created",
        description: `${newUser.username} has been added.`,
        variant: "success",
      });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to add user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation<
    User,
    any,
    { id: string } & Partial<Omit<User, "id">>
  >({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User updated", variant: "success" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation<string, any, string>({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User deleted" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const suspendUserMutation = useMutation<User, any, string>({
    mutationFn: suspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User suspended" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to suspend user",
        variant: "destructive",
      });
    },
  });

  const unsuspendUserMutation = useMutation<User, any, string>({
    mutationFn: unsuspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User unsuspended" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to unsuspend user",
        variant: "destructive",
      });
    },
  });

  // Convenience: picks the right mutation based on current status
  const toggleUserStatus = (user: User): Promise<User> => {
    if (user.status === "active") {
      return suspendUserMutation.mutateAsync(user.id);
    }
    return unsuspendUserMutation.mutateAsync(user.id);
  };

  return {
    // Data
    users,
    usersLoading,
    usersError,
    // Mutations
    addUser: addUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    suspendUser: suspendUserMutation.mutateAsync,
    unsuspendUser: unsuspendUserMutation.mutateAsync,
    toggleUserStatus,
    // Pending states
    isAddingUser: addUserMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
    isTogglingStatus:
      suspendUserMutation.isPending || unsuspendUserMutation.isPending,
  };
};
