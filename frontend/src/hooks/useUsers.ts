"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/types";

export function useAllUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<User[]>("/users").then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; role?: string; rating?: number }) =>
      api.patch<User>(`/users/${id}`, data).then((r) => r.data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; studentId?: string }) =>
      api.put<User>("/users/me", data).then((r) => r.data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<User>("/users/me").then((r) => r.data),
    staleTime: 60_000,
  });
}
