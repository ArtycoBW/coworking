"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import type { AppNotification } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";

let globalSocket: Socket | null = null;

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        connectedRef.current = false;
      }
      return;
    }

    if (globalSocket?.connected && connectedRef.current) return;

    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
    }

    const socket = io(`${WS_URL}/notifications`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    });

    globalSocket = socket;

    socket.on("connect", () => {
      connectedRef.current = true;
    });

    socket.on("disconnect", () => {
      connectedRef.current = false;
    });

    socket.on("notification", (data: AppNotification) => {
      toast(data.title, {
        description: data.message,
        duration: 6000,
      });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    });

    socket.on("space_status_changed", () => {
      void qc.invalidateQueries({ queryKey: ["spaces"] });
    });

    socket.on("booking_changed", () => {
      void qc.invalidateQueries({ queryKey: ["spaces"] });
      void qc.invalidateQueries({ queryKey: ["bookings"] });
    });

    return () => {
      socket.off("notification");
      socket.off("space_status_changed");
      socket.off("booking_changed");
    };
  }, [isAuthenticated, token, qc]);
}
