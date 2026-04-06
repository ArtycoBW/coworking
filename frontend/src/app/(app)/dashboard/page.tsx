"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LogOut, LayoutDashboard, Calendar, Clock, Wifi, Users,
  Bell, CheckCheck, MapPin, ArrowRight, Loader2, X, TrendingUp, Shield, Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { AnimatedGradientBackground } from "@/components/ui/animated-gradient-background";
import { useMyBookings, useCancelBooking } from "@/hooks/useBookings";
import { useNotifications, useMarkAllRead } from "@/hooks/useNotifications";
import type { Booking } from "@/types";

function spaceName(b: Booking) {
  return b.space.type === "DESK"
    ? b.space.name.replace("Desk ", "Место ")
    : b.space.name.replace("Meeting Room ", "Переговорная ");
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    CONFIRMED: { label: "Подтверждено", color: "#4f8ef7", bg: "rgba(79,142,247,0.15)" },
    PENDING:   { label: "Ожидание",     color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
    CANCELLED: { label: "Отменено",     color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    COMPLETED: { label: "Завершено",    color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
    NO_SHOW:   { label: "Неявка",       color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  };
  const s = map[status];
  return (
    <span style={{
      fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600,
      color: s.color, background: s.bg, border: `1px solid ${s.color}40`,
      borderRadius: "6px", padding: "2px 8px", whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  delay?: number;
  trend?: string;
}

function StatCard({ label, value, icon: Icon, color, delay = 0, trend }: StatCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-2xl p-5 cursor-default"
      style={{
        background: hovered
          ? "rgba(22,27,39,0.95)"
          : "rgba(16,20,32,0.75)",
        border: `1px solid ${hovered ? color + "40" : "rgba(255,255,255,0.07)"}`,
        backdropFilter: "blur(20px)",
        transition: "all 0.3s ease",
        boxShadow: hovered ? `0 0 32px ${color}18` : "none",
      }}
    >
      {/* halo */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.7 }}
        transition={{ duration: 0.4 }}
        className="absolute -top-8 -right-8 size-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}22 0%, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="size-9 rounded-xl flex items-center justify-center"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}
          >
            <Icon className="size-4" style={{ color }} strokeWidth={1.5} />
          </div>
          {trend && (
            <div className="flex items-center gap-1" style={{ color: "#34d399" }}>
              <TrendingUp className="size-3" />
              <span style={{ fontFamily: "var(--font-tech)", fontSize: "11px" }}>{trend}</span>
            </div>
          )}
        </div>

        <div style={{ fontFamily: "var(--font-tech)", fontSize: "28px", fontWeight: 700, color: "#fff", letterSpacing: "0.02em", lineHeight: 1 }}>
          {value}
        </div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "rgba(136,146,164,0.7)", marginTop: "6px" }}>
          {label}
        </p>
      </div>

      {/* bottom accent line */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 h-px origin-left"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [bellOpen, setBellOpen] = useState(false);

  const { data: bookings = [] } = useMyBookings();
  const { data: notifications = [] } = useNotifications();
  const cancelMutation = useCancelBooking();
  const markAllRead = useMarkAllRead();

  const now = new Date();
  const activeCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const hoursThisMonth = bookings
    .filter((b) => {
      if (b.status !== "COMPLETED") return false;
      const d = new Date(b.startTime);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, b) => acc + (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / 3_600_000, 0);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const upcoming = bookings
    .filter((b) => b.status === "CONFIRMED" && new Date(b.startTime) > now)
    .slice(0, 3);

  const STATS: StatCardProps[] = [
    { label: "Активных броней",       value: String(activeCount),  icon: Calendar, color: "#4f8ef7", delay: 0.08 },
    { label: "Часов в этом месяце",   value: hoursThisMonth % 1 === 0 ? String(hoursThisMonth) : hoursThisMonth.toFixed(1), icon: Clock, color: "#a78bfa", delay: 0.14 },
    { label: "Свободных мест",        value: "—",                  icon: Users,    color: "#34d399", delay: 0.20 },
    { label: "Скорость сети",         value: "10 Гбит",            icon: Wifi,     color: "#f59e0b", delay: 0.26, trend: "+2%" },
  ];

  const handleLogout = () => { logout(); router.replace("/login"); };

  const handleCancel = (id: string) => {
    cancelMutation.mutate(id, {
      onSuccess: () => toast.success("Бронирование отменено"),
      onError: () => toast.error("Не удалось отменить"),
    });
  };

  return (
    <div className="min-h-screen relative" style={{ background: "#0a0d14" }}>
      <AnimatedGradientBackground />

      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 h-14"
        style={{
          background: "rgba(10,13,20,0.75)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(79,142,247,0.2)", border: "1px solid rgba(79,142,247,0.3)" }}>
            <LayoutDashboard className="size-3.5 text-[#4f8ef7]" />
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.22em", color: "#4f8ef7" }}>
            GARAGE
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setBellOpen((v) => !v)}
              className="relative flex items-center justify-center size-8 rounded-full transition-colors hover:bg-white/5"
              style={{ color: unreadCount > 0 ? "#4f8ef7" : "rgba(136,146,164,0.6)" }}
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-4 rounded-full text-[9px] font-bold text-white"
                  style={{ background: "#ef4444" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {bellOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 w-80 rounded-2xl overflow-hidden z-50"
                  style={{ background: "rgba(16,20,32,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: "13px", fontWeight: 600, color: "#fff" }}>Уведомления</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={() => markAllRead.mutate()} className="flex items-center gap-1 rounded-full px-2 py-0.5 hover:bg-white/5"
                          style={{ fontFamily: "var(--font-sans)", fontSize: "10px", color: "#4f8ef7" }}>
                          <CheckCheck className="size-3" /> Все прочитано
                        </button>
                      )}
                      <button onClick={() => setBellOpen(false)} className="text-white/30 hover:text-white/70 transition-colors">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center py-8" style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "rgba(136,146,164,0.5)" }}>
                        Нет уведомлений
                      </p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div key={n.id} className="px-4 py-3 border-b last:border-0"
                          style={{ borderColor: "rgba(255,255,255,0.04)", background: n.read ? "transparent" : "rgba(79,142,247,0.04)" }}>
                          <div className="flex items-start gap-2">
                            {!n.read && <div className="size-1.5 rounded-full bg-[#4f8ef7] mt-1.5 flex-shrink-0" />}
                            <div className={!n.read ? "" : "pl-3.5"}>
                              <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 600, color: n.read ? "rgba(200,210,230,0.7)" : "#e8edf5", marginBottom: "2px" }}>{n.title}</p>
                              <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "rgba(136,146,164,0.6)" }}>{n.message}</p>
                              <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(136,146,164,0.35)", marginTop: "4px" }}>
                                {format(new Date(n.createdAt), "d MMM, HH:mm", { locale: ru })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />

          {user?.role === "ADMIN" && (
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full hover:bg-white/5 transition-colors"
              style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.15em", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}
            >
              <Shield className="size-3" /> ADMIN
            </button>
          )}

          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 h-8 px-3 rounded-full hover:bg-white/5 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="size-5 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(79,142,247,0.4), rgba(167,139,250,0.4))" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "9px", fontWeight: 700, color: "#fff" }}>
                {user?.name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </span>
            </div>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(136,146,164,0.8)" }}>{user?.name?.split(" ")[0]}</span>
          </button>

          <Button variant="ghost" size="sm" onClick={handleLogout}
            className="h-8 px-3 rounded-full text-muted-foreground hover:text-white hover:bg-white/5">
            <LogOut className="size-3.5 mr-1.5" />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "11px", letterSpacing: "0.12em" }}>Выйти</span>
          </Button>
        </div>
      </header>

      <main className="relative z-10 px-6 py-10 max-w-6xl mx-auto">
        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.28em", color: "#4f8ef7", textTransform: "uppercase" }}>
              Dashboard · {format(now, "d MMMM yyyy", { locale: ru })}
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>
            Привет,{" "}
            <span style={{ background: "linear-gradient(135deg, #4f8ef7, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {user?.name?.split(" ")[0]}
            </span>
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "rgba(136,146,164,0.7)", marginTop: "8px" }}>
            Добро пожаловать в Garage Coworking
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="flex gap-3 mb-10"
        >
          <button
            onClick={() => router.push("/booking")}
            className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all"
            style={{ background: "rgba(79,142,247,0.15)", border: "1px solid rgba(79,142,247,0.3)", color: "#4f8ef7" }}
          >
            <Calendar className="size-4" />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "12px", letterSpacing: "0.08em" }}>Забронировать</span>
            <ArrowRight className="size-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => router.push("/history")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:bg-white/5"
            style={{ border: "1px solid rgba(255,255,255,0.07)", color: "rgba(136,146,164,0.7)" }}
          >
            <Clock className="size-4" />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "12px", letterSpacing: "0.08em" }}>История броней</span>
          </button>
          <button
            onClick={() => router.push("/chat")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:bg-[rgba(167,139,250,0.1)]"
            style={{ border: "1px solid rgba(167,139,250,0.2)", color: "rgba(167,139,250,0.8)" }}
          >
            <Sparkles className="size-4" />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "12px", letterSpacing: "0.08em" }}>AI Ассистент</span>
          </button>
        </motion.div>

        {/* Upcoming bookings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-[#4f8ef7] animate-pulse" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.25em", color: "#4f8ef7", textTransform: "uppercase" }}>
                Ближайшие брони
              </span>
            </div>
            <button
              onClick={() => router.push("/history")}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-white/5 text-xs"
              style={{ fontFamily: "var(--font-sans)", color: "rgba(136,146,164,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              Все брони <ArrowRight className="size-3" />
            </button>
          </div>

          {upcoming.length === 0 ? (
            <div
              className="rounded-2xl p-10 flex flex-col items-center justify-center text-center"
              style={{ background: "rgba(16,20,32,0.6)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", minHeight: "180px" }}
            >
              <div className="size-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.15)" }}>
                <Calendar className="size-5 text-primary/50" strokeWidth={1.5} />
              </div>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "15px", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>
                Нет активных броней
              </p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "rgba(136,146,164,0.4)", marginTop: "6px" }}>
                Забронируй рабочее место или переговорную
              </p>
              <Button
                className="mt-5 rounded-full h-9 px-5"
                style={{ background: "rgba(79,142,247,0.85)", fontFamily: "var(--font-heading)", fontSize: "12px", letterSpacing: "0.1em", boxShadow: "0 0 24px rgba(79,142,247,0.25)" }}
                onClick={() => router.push("/booking")}
              >
                Забронировать
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.42 + i * 0.07 }}
                  className="group rounded-xl px-5 py-4 flex items-center gap-4"
                  style={{
                    background: "rgba(16,20,32,0.7)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(12px)",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(79,142,247,0.25)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                >
                  <div
                    className="size-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.2)" }}
                  >
                    <MapPin className="size-4 text-primary/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "#fff" }}>
                      {spaceName(b)}
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "rgba(136,146,164,0.65)", marginTop: "2px" }}>
                      {format(new Date(b.startTime), "d MMMM, HH:mm", { locale: ru })} — {format(new Date(b.endTime), "HH:mm")}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelMutation.isPending}
                    className="h-7 px-3 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {cancelMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : "Отменить"}
                  </Button>
                </motion.div>
              ))}

              <button
                onClick={() => router.push("/booking")}
                className="w-full rounded-xl py-3 text-center transition-colors hover:bg-white/[0.02]"
                style={{ background: "rgba(16,20,32,0.4)", border: "1px dashed rgba(255,255,255,0.07)" }}
              >
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "rgba(136,146,164,0.4)" }}>
                  + Добавить бронирование
                </span>
              </button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
