"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse, LoginDto, RegisterDto, User } from "@/types";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginDto) =>
      api.post<AuthResponse>("/auth/login", data).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      router.push("/dashboard");
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterDto) =>
      api.post<AuthResponse>("/auth/register", data).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      router.push("/dashboard");
    },
  });
}

export function useMe() {
  const { token, setAuth, logout } = useAuthStore();

  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<User>("/auth/me").then((r) => r.data),
    enabled: !!token,
    retry: false,
  });
}
