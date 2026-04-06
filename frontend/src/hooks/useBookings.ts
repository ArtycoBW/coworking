"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Booking, BookingStatus } from "@/types";

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings", "my"],
    queryFn: () => api.get<Booking[]>("/bookings/my").then((r) => r.data),
    staleTime: 15_000,
  });
}

export function useAllBookings() {
  return useQuery({
    queryKey: ["bookings", "all"],
    queryFn: () => api.get<(Booking & { user: { id: string; name: string; email: string } })[]>("/bookings").then((r) => r.data),
    staleTime: 15_000,
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      api.patch(`/bookings/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["bookings"] });
      void qc.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<Booking>(`/bookings/${id}/cancel`).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["bookings", "my"] });
      void qc.invalidateQueries({ queryKey: ["spaces"] });
    },
    onError: () => {
      toast.error("Не удалось отменить бронирование");
    },
  });
}
