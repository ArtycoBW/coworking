"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import type { AppNotification } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";

// Module-level singleton — persists across React renders and StrictMode double-mounts
let globalSocket: Socket | null = null;

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore();
  const qc = useQueryClient();

  useEffect(() => {
    // Logged out — clean up
    if (!isAuthenticated || !token) {
      if (globalSocket) {
        globalSocket.removeAllListeners();
        globalSocket.disconnect();
        globalSocket = null;
      }
      return;
    }

    // Already connected — don't disconnect, just re-bind handlers below
    if (!globalSocket?.connected) {
      if (globalSocket) {
        globalSocket.removeAllListeners();
        globalSocket.disconnect();
      }

      globalSocket = io(`${WS_URL}/notifications`, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5,
      });
    }

    const socket = globalSocket;

    const onNotification = (data: AppNotification) => {
      toast(data.title, { description: data.message, duration: 6000 });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    };
    const onSpaceChanged = () => void qc.invalidateQueries({ queryKey: ["spaces"] });
    const onBookingChanged = () => {
      void qc.invalidateQueries({ queryKey: ["spaces"] });
      void qc.invalidateQueries({ queryKey: ["bookings"] });
    };

    // Remove all previous instances before adding — prevents duplicates on StrictMode re-mount
    socket
      .off("notification").on("notification", onNotification)
      .off("space_status_changed").on("space_status_changed", onSpaceChanged)
      .off("booking_changed").on("booking_changed", onBookingChanged);

    return () => {
      socket.off("notification", onNotification);
      socket.off("space_status_changed", onSpaceChanged);
      socket.off("booking_changed", onBookingChanged);
    };
  }, [isAuthenticated, token, qc]);
}
