"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Booking } from "@/types";

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings", "my"],
    queryFn: () => api.get<Booking[]>("/bookings/my").then((r) => r.data),
    staleTime: 15_000,
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
  });
}
