"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ChatMessage {
  role: "user" | "model";
  parts: string;
}

export function useSendMessage() {
  return useMutation({
    mutationFn: ({
      message,
      history,
    }: {
      message: string;
      history: ChatMessage[];
    }) =>
      api
        .post<{ reply: string }>("/ai/chat", { message, history })
        .then((r) => r.data.reply),
  });
}
