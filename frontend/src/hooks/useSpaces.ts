"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Space, SpaceType } from "@/types";

export function useSpaces() {
  return useQuery({
    queryKey: ["spaces"],
    queryFn: () => api.get<Space[]>("/spaces").then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useAvailableSpaces(params: {
  startTime: string;
  endTime: string;
  type?: SpaceType;
} | null) {
  return useQuery({
    queryKey: ["spaces", "availability", params],
    queryFn: () =>
      api
        .get<Space[]>("/spaces/availability", { params: params! })
        .then((r) => r.data),
    enabled: !!params,
    staleTime: 15_000,
  });
}
