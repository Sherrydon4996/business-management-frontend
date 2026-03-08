// src/hooks/useMovieBookingsApi.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/Apis/axiosApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BookingType = "movie" | "series";
export type BookingStatus =
  | "active"
  | "pending"
  | "delivered"
  | "cancelled"
  | "overdue";

export interface MovieBooking {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  title: string;
  type: BookingType;
  pick_date: string; // YYYY-MM-DD
  //   return_date: string; // YYYY-MM-DD
  amount: number;
  status: BookingStatus;
  booked_at: string;
  created_at: string;
}

export interface CreateBookingPayload {
  customer_name: string;
  customer_phone?: string;
  title: string;
  type: BookingType;
  pick_date: string;
  //   return_date: string;
  amount: number;
}

export interface UpdateBookingPayload {
  customer_name?: string;
  customer_phone?: string;
  title?: string;
  type?: BookingType;
  pick_date?: string;
  //   return_date?: string;
  amount?: number;
  status?: BookingStatus;
}

// ─── API Functions ────────────────────────────────────────────────────────────

const fetchBookings = async (): Promise<MovieBooking[]> => {
  const res = await api.get<{ success: boolean; records: MovieBooking[] }>(
    "/api/v1/movie-bookings/get",
  );
  return res.data.records || [];
};

const createBooking = async (
  data: CreateBookingPayload,
): Promise<MovieBooking> => {
  const res = await api.post<{ success: boolean; data: MovieBooking }>(
    "/api/v1/admin/movie-bookings/create",
    data,
  );
  return res.data.data;
};

const updateStatus = async (payload: {
  id: string;
  status: BookingStatus;
}): Promise<MovieBooking> => {
  const res = await api.patch<{ success: boolean; data: MovieBooking }>(
    `/api/v1/admin/movie-bookings/status/${payload.id}`,
    { status: payload.status },
  );
  return res.data.data;
};

const updateBooking = async (
  data: { id: string } & UpdateBookingPayload,
): Promise<MovieBooking> => {
  const { id, ...payload } = data;
  const res = await api.put<{ success: boolean; data: MovieBooking }>(
    `/api/v1/admin/movie-bookings/update/${id}`,
    payload,
  );
  return res.data.data;
};

const deleteBooking = async (id: string): Promise<string> => {
  await api.delete(`/api/v1/admin/movie-bookings/delete/${id}`);
  return id;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useMovieBookingsApi = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: bookingList = [],
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery<MovieBooking[]>({
    queryKey: ["movie-bookings"],
    queryFn: fetchBookings,
    // Refresh every 5 min so auto-cancelled bookings reflect without manual reload
    refetchInterval: 5 * 60 * 1000,
  });

  const createMutation = useMutation<MovieBooking, any, CreateBookingPayload>({
    mutationFn: createBooking,
    onSuccess: (b) => {
      queryClient.invalidateQueries({ queryKey: ["movie-bookings"] });
      toast({
        title: "Booking added",
        description: `${b.title} — ${b.customer_name}`,
      });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to add booking",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation<
    MovieBooking,
    any,
    { id: string; status: BookingStatus }
  >({
    mutationFn: updateStatus,
    onSuccess: (b) => {
      queryClient.invalidateQueries({ queryKey: ["movie-bookings"] });
      toast({ title: `Marked as ${b.status}` });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation<
    MovieBooking,
    any,
    { id: string } & UpdateBookingPayload
  >({
    mutationFn: updateBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-bookings"] });
      toast({ title: "Booking updated" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to update booking",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation<string, any, string>({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-bookings"] });
      toast({ title: "Booking deleted" });
    },
    onError: (err) => {
      toast({
        title: err?.response?.data?.code ?? "Error",
        description: err?.response?.data?.message || "Failed to delete booking",
        variant: "destructive",
      });
    },
  });

  return {
    bookingList,
    bookingsLoading,
    bookingsError,
    createBooking: createMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    updateBooking: updateMutation.mutateAsync,
    deleteBooking: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
