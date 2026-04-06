"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Shield, Users, Calendar, Building2, BarChart3,
  Loader2, Star, X, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { AnimatedGradientBackground } from "@/components/ui/animated-gradient-background";
import { useAllUsers, useUpdateUser } from "@/hooks/useUsers";
import { useAllBookings, useUpdateBookingStatus } from "@/hooks/useBookings";
import { useSpaces } from "@/hooks/useSpaces";
import { api } from "@/lib/api";
import type { BookingStatus, SpaceStatus } from "@/types";

const STATUS_MAP: Record<BookingStatus, { label: string; color: string }> = {
  CONFIRMED: { label: "Подтверждено", color: "#4f8ef7" },
  PENDING:   { label: "Ожидание",     color: "#f59e0b" },
  CANCELLED: { label: "Отменено",     color: "#ef4444" },
  COMPLETED: { label: "Завершено",    color: "#6b7280" },
  NO_SHOW:   { label: "Неявка",       color: "#f97316" },
};

const SPACE_STATUS_MAP: Record<SpaceStatus, { label: string; color: string }> = {
  AVAILABLE:   { label: "Доступно",      color: "#34d399" },
  OCCUPIED:    { label: "Занято",        color: "#f59e0b" },
  MAINTENANCE: { label: "Обслуживание",  color: "#ef4444" },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600, color: s.color,
      background: `${s.color}18`, border: `1px solid ${s.color}35`, borderRadius: "6px", padding: "2px 8px", whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function SpaceStatusBadge({ status }: { status: SpaceStatus }) {
  const s = SPACE_STATUS_MAP[status];
  return (
    <span style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600, color: s.color,
      background: `${s.color}18`, border: `1px solid ${s.color}35`, borderRadius: "6px", padding: "2px 8px", whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab() {
  const { data: users = [] } = useAllUsers();
  const { data: bookings = [] } = useAllBookings();
  const { data: spaces = [] } = useSpaces();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayActive = bookings.filter((b) =>
    (b.status === "CONFIRMED" || b.status === "PENDING") &&
    new Date(b.startTime) >= todayStart && new Date(b.startTime) < new Date(todayStart.getTime() + 86400000)
  ).length;

  const stats = [
    { label: "Пользователей",       value: users.length,    color: "#4f8ef7",  icon: Users },
    { label: "Всего броней",        value: bookings.length, color: "#a78bfa",  icon: Calendar },
    { label: "Активных сегодня",    value: todayActive,     color: "#34d399",  icon: BarChart3 },
    { label: "Пространств",         value: spaces.length,   color: "#f59e0b",  icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-xl p-5"
            style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="size-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
              <s.icon className="size-3.5" style={{ color: s.color }} strokeWidth={1.5} />
            </div>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: "26px", fontWeight: 700, color: "#fff" }}>{s.value}</div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "rgba(136,146,164,0.65)", marginTop: "4px" }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent bookings */}
      <div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.22em", color: "#4f8ef7", textTransform: "uppercase", marginBottom: "12px" }}>
          Последние бронирования
        </p>
        <div className="space-y-2">
          {bookings.slice(0, 5).map((b) => (
            <div key={b.id} className="flex items-center gap-4 rounded-xl px-4 py-3"
              style={{ background: "rgba(16,20,32,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex-1 min-w-0">
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "13px", color: "#e8edf5" }}>
                  {b.user?.name ?? "—"}
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "rgba(136,146,164,0.55)", marginLeft: "8px" }}>
                  {b.space.name.replace("Desk ", "Место ").replace("Meeting Room ", "Переговорная ")}
                </span>
              </div>
              <span style={{ fontFamily: "var(--font-tech)", fontSize: "11px", color: "rgba(136,146,164,0.5)" }}>
                {format(new Date(b.startTime), "d MMM HH:mm", { locale: ru })}
              </span>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab({ currentUserId }: { currentUserId: string }) {
  const { data: users = [], isLoading } = useAllUsers();
  const updateUser = useUpdateUser();

  const toggleRole = (id: string, current: string) => {
    const next = current === "ADMIN" ? "USER" : "ADMIN";
    updateUser.mutate({ id, role: next }, {
      onSuccess: () => toast.success(`Роль изменена на ${next}`),
      onError: () => toast.error("Ошибка"),
    });
  };

  const adjustRating = (id: string, current: number, delta: number) => {
    const next = Math.max(0, Math.min(5, Math.round((current + delta) * 10) / 10));
    updateUser.mutate({ id, rating: next }, {
      onSuccess: () => toast.success(`Рейтинг: ${next.toFixed(1)}`),
      onError: () => toast.error("Ошибка"),
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-primary/40" /></div>;

  return (
    <div className="space-y-2">
      {users.map((u, i) => (
        <motion.div key={u.id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          className="flex items-center gap-4 rounded-xl px-4 py-3"
          style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Avatar */}
          <div className="size-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(79,142,247,0.15)", border: "1px solid rgba(79,142,247,0.2)" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "12px", fontWeight: 700, color: "#4f8ef7" }}>
              {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </span>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "13px", fontWeight: 600, color: "#e8edf5" }}>{u.name}</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "rgba(136,146,164,0.55)" }}>{u.email}</p>
          </div>
          {/* Role */}
          <button onClick={() => toggleRole(u.id, u.role)}
            className="px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
            style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.12em",
              color: u.role === "ADMIN" ? "#a78bfa" : "rgba(136,146,164,0.6)",
              background: u.role === "ADMIN" ? "rgba(167,139,250,0.12)" : "rgba(136,146,164,0.08)",
              border: `1px solid ${u.role === "ADMIN" ? "rgba(167,139,250,0.3)" : "rgba(136,146,164,0.15)"}` }}>
            {u.role}
          </button>
          {/* Rating */}
          <div className="flex items-center gap-1">
            <button onClick={() => adjustRating(u.id, u.rating, -0.5)}
              disabled={u.id === currentUserId}
              className="size-6 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "rgba(136,146,164,0.6)" }}>−</button>
            <span className="flex items-center gap-1" style={{ minWidth: "36px", justifyContent: "center" }}>
              <Star className="size-3" style={{ color: "#f59e0b", fill: "#f59e0b" }} />
              <span style={{ fontFamily: "var(--font-tech)", fontSize: "12px", color: "#f59e0b" }}>{u.rating.toFixed(1)}</span>
            </span>
            <button onClick={() => adjustRating(u.id, u.rating, 0.5)}
              className="size-6 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors"
              style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "rgba(136,146,164,0.6)" }}>+</button>
          </div>
          {/* Date */}
          <span style={{ fontFamily: "var(--font-tech)", fontSize: "10px", color: "rgba(136,146,164,0.35)", minWidth: "64px", textAlign: "right" }}>
            {format(new Date(u.createdAt), "d MMM yy", { locale: ru })}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ── Bookings Tab ──────────────────────────────────────────────────────────────
function BookingsTab() {
  const { data: bookings = [], isLoading } = useAllBookings();
  const updateStatus = useUpdateBookingStatus();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "ALL">("ALL");

  const filtered = bookings.filter((b) => {
    const matchSearch = !search || b.user?.email?.toLowerCase().includes(search.toLowerCase()) || b.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const forceCancel = (id: string) => {
    updateStatus.mutate({ id, status: "CANCELLED" }, {
      onSuccess: () => toast.success("Бронирование отменено"),
      onError: () => toast.error("Ошибка"),
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-primary/40" /></div>;

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2"
          style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Search className="size-3.5 text-primary/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или email..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "#e8edf5" }} />
          {search && <button onClick={() => setSearch("")}><X className="size-3.5 text-white/30 hover:text-white/60" /></button>}
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as BookingStatus | "ALL")}>
          <SelectTrigger className="h-9 rounded-xl text-xs"
            style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(200,210,230,0.8)", minWidth: "140px" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/8"
            style={{ background: "rgba(16,20,32,0.97)", backdropFilter: "blur(16px)" }}>
            <SelectItem value="ALL" className="text-xs focus:bg-white/8 focus:text-white rounded-lg">Все статусы</SelectItem>
            {(Object.keys(STATUS_MAP) as BookingStatus[]).map((s) => (
              <SelectItem key={s} value={s} className="text-xs focus:bg-white/8 focus:text-white rounded-lg">{STATUS_MAP[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.map((b, i) => (
        <motion.div key={b.id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
          className="flex items-center gap-4 rounded-xl px-4 py-3"
          style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "13px", color: "#e8edf5" }}>{b.user?.name ?? "—"}</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "rgba(136,146,164,0.5)" }}>{b.user?.email}</p>
          </div>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "rgba(200,210,230,0.7)", minWidth: "120px" }}>
            {b.space.name.replace("Desk ", "Место ").replace("Meeting Room ", "Переговорная ")}
          </span>
          <span style={{ fontFamily: "var(--font-tech)", fontSize: "11px", color: "rgba(136,146,164,0.5)", minWidth: "120px" }}>
            {format(new Date(b.startTime), "d MMM, HH:mm", { locale: ru })} – {format(new Date(b.endTime), "HH:mm")}
          </span>
          <StatusBadge status={b.status} />
          {(b.status === "CONFIRMED" || b.status === "PENDING") ? (
            <Button variant="ghost" size="sm" onClick={() => forceCancel(b.id)} disabled={updateStatus.isPending}
              className="h-7 px-2.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
              style={{ fontFamily: "var(--font-sans)", border: "1px solid rgba(239,68,68,0.2)" }}>
              Отменить
            </Button>
          ) : (
            <div className="w-16" />
          )}
        </motion.div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-10" style={{ color: "rgba(136,146,164,0.4)", fontFamily: "var(--font-sans)", fontSize: "13px" }}>
          Бронирований не найдено
        </div>
      )}
    </div>
  );
}

// ── Spaces Tab ────────────────────────────────────────────────────────────────
function SpacesTab() {
  const { data: spaces = [], isLoading, refetch } = useSpaces();

  const toggleMaintenance = async (id: string, current: string) => {
    const next = current === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
    try {
      await api.put(`/spaces/${id}`, { status: next });
      toast.success(`Статус изменён на ${SPACE_STATUS_MAP[next as SpaceStatus].label}`);
      void refetch();
    } catch {
      toast.error("Ошибка");
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-primary/40" /></div>;

  return (
    <div className="space-y-2">
      {spaces.map((s, i) => (
        <motion.div key={s.id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          className="flex items-center gap-4 rounded-xl px-4 py-3"
          style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "13px", color: "#e8edf5" }}>
              {s.name.replace("Desk ", "Место ").replace("Meeting Room ", "Переговорная ")}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "rgba(136,146,164,0.5)", marginTop: "2px" }}>
              {s.type === "DESK" ? "Рабочее место" : `Переговорная · ${s.capacity} чел.`}
            </p>
          </div>
          <SpaceStatusBadge status={s.status} />
          <button
            onClick={() => toggleMaintenance(s.id, s.status)}
            className="px-3 py-1.5 rounded-lg transition-all hover:opacity-80 text-xs flex-shrink-0"
            style={{
              fontFamily: "var(--font-sans)",
              color: s.status === "MAINTENANCE" ? "#34d399" : "#ef4444",
              background: s.status === "MAINTENANCE" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${s.status === "MAINTENANCE" ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`,
            }}
          >
            {s.status === "MAINTENANCE" ? "Вернуть в строй" : "На обслуживание"}
          </button>
        </motion.div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen relative" style={{ background: "#0a0d14" }}>
      <AnimatedGradientBackground />
      <header
        className="sticky top-0 z-50 flex items-center gap-4 px-6 h-14"
        style={{ background: "rgba(10,13,20,0.85)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}
          className="h-8 px-3 gap-1.5 rounded-full text-muted-foreground hover:text-white hover:bg-white/5">
          <ArrowLeft className="size-3.5" />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "11px", letterSpacing: "0.12em" }}>Дашборд</span>
        </Button>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <Shield className="size-3.5 text-[#a78bfa]" />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", color: "#a78bfa" }}>ADMIN</span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>/</span>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "#fff" }}>Панель управления</span>
        </div>
      </header>

      <main className="px-6 py-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Tabs defaultValue="overview">
            <TabsList className="mb-8 h-11 gap-1"
              style={{ background: "rgba(16,20,32,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "4px" }}>
              {[
                { value: "overview",  label: "Обзор",          icon: BarChart3 },
                { value: "users",     label: "Пользователи",   icon: Users },
                { value: "bookings",  label: "Бронирования",   icon: Calendar },
                { value: "spaces",    label: "Пространства",   icon: Building2 },
              ].map((t) => (
                <TabsTrigger key={t.value} value={t.value}
                  className="flex items-center gap-1.5 rounded-xl px-5 h-8 data-[state=active]:text-white data-[state=active]:bg-white/10"
                  style={{ fontFamily: "var(--font-heading)", fontSize: "12px", letterSpacing: "0.06em" }}>
                  <t.icon className="size-3.5" />
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview"><OverviewTab /></TabsContent>
            <TabsContent value="users"><UsersTab currentUserId={user.id} /></TabsContent>
            <TabsContent value="bookings"><BookingsTab /></TabsContent>
            <TabsContent value="spaces"><SpacesTab /></TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
