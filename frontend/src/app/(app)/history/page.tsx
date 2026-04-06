"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, Loader2, MapPin, Clock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyBookings, useCancelBooking } from "@/hooks/useBookings";
import type { Booking, BookingStatus } from "@/types";

function spaceName(b: Booking) {
  return b.space.type === "DESK"
    ? b.space.name.replace("Desk ", "Место ")
    : b.space.name.replace("Meeting Room ", "Переговорная ");
}

const STATUS_MAP: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: "Подтверждено", color: "#4f8ef7", bg: "rgba(79,142,247,0.12)" },
  PENDING:   { label: "Ожидание",     color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  CANCELLED: { label: "Отменено",     color: "#ef4444", bg: "rgba(239,68,68,0.10)" },
  COMPLETED: { label: "Завершено",    color: "#6b7280", bg: "rgba(107,114,128,0.10)" },
  NO_SHOW:   { label: "Неявка",       color: "#f97316", bg: "rgba(249,115,22,0.12)" },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span style={{
      fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600,
      color: s.color, background: s.bg, border: `1px solid ${s.color}35`,
      borderRadius: "8px", padding: "3px 10px", whiteSpace: "nowrap",
      letterSpacing: "0.02em",
    }}>
      {s.label}
    </span>
  );
}

function durationStr(startTime: string, endTime: string) {
  const h = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 3_600_000;
  return h % 1 === 0 ? `${h} ч` : `${h.toFixed(1)} ч`;
}

export default function HistoryPage() {
  const router = useRouter();
  const { data: bookings = [], isLoading } = useMyBookings();
  const cancelMutation = useCancelBooking();

  const now = new Date();

  const canCancel = (b: Booking) =>
    b.status === "CONFIRMED" && new Date(b.startTime).getTime() > now.getTime() + 15 * 60 * 1000;

  const handleCancel = (id: string) => {
    cancelMutation.mutate(id, {
      onSuccess: () => toast.success("Бронирование отменено"),
      onError: () => toast.error("Не удалось отменить"),
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0d14" }}>
      <header
        className="sticky top-0 z-50 flex items-center gap-4 px-6 h-14"
        style={{ background: "rgba(10,13,20,0.85)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}
          className="h-8 px-3 gap-1.5 rounded-full text-muted-foreground hover:text-white hover:bg-white/5">
          <ArrowLeft className="size-3.5" />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "11px", letterSpacing: "0.12em" }}>Назад</span>
        </Button>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", color: "#4f8ef7" }}>GARAGE</span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>/</span>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "#fff" }}>История броней</span>
        </div>
      </header>

      <main className="px-6 py-10 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="size-1.5 rounded-full bg-[#4f8ef7]" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.25em", color: "#4f8ef7", textTransform: "uppercase" }}>
              История бронирований
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: "#fff", marginBottom: "32px" }}>
            Мои брони
          </h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="size-6 animate-spin text-primary/40" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl p-14 flex flex-col items-center justify-center text-center"
              style={{ background: "rgba(16,20,32,0.7)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
              <div className="size-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.15)" }}>
                <CalendarClock className="size-6 text-primary/40" strokeWidth={1.5} />
              </div>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>
                Нет броней
              </p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(136,146,164,0.4)", marginTop: "6px" }}>
                Создайте первое бронирование
              </p>
              <Button className="mt-6 rounded-full h-9 px-5"
                style={{ background: "rgba(79,142,247,0.85)", fontFamily: "var(--font-heading)", fontSize: "12px", letterSpacing: "0.1em" }}
                onClick={() => router.push("/booking")}>
                Забронировать
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: i * 0.04 }}
                  className="group rounded-2xl px-5 py-4"
                  style={{
                    background: "rgba(16,20,32,0.75)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(12px)",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(79,142,247,0.2)";
                    e.currentTarget.style.background = "rgba(16,20,32,0.9)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.background = "rgba(16,20,32,0.75)";
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="size-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.18)" }}
                    >
                      <MapPin className="size-4 text-primary/60" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "#e8edf5" }}>
                          {spaceName(b)}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="size-3 text-primary/40" />
                          <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "rgba(136,146,164,0.65)" }}>
                            {format(new Date(b.startTime), "d MMMM yyyy", { locale: ru })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3 text-primary/40" />
                          <span style={{ fontFamily: "var(--font-tech)", fontSize: "12px", color: "rgba(136,146,164,0.65)" }}>
                            {format(new Date(b.startTime), "HH:mm")} — {format(new Date(b.endTime), "HH:mm")}
                          </span>
                          <span style={{ fontFamily: "var(--font-tech)", fontSize: "11px", color: "rgba(136,146,164,0.35)", paddingLeft: "2px" }}>
                            · {durationStr(b.startTime, b.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {canCancel(b) ? (
                        <Button variant="ghost" size="sm" onClick={() => handleCancel(b.id)}
                          disabled={cancelMutation.isPending}
                          className="h-8 px-3 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          style={{ fontFamily: "var(--font-sans)", border: "1px solid rgba(239,68,68,0.2)" }}>
                          {cancelMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : "Отменить"}
                        </Button>
                      ) : (
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "rgba(136,146,164,0.2)" }}>—</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
