"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  Calendar,
  Loader2,
  Search,
  Shield,
  Star,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatedGradientBackground } from "@/components/ui/animated-gradient-background";
import { useAllBookings, useUpdateBookingStatus } from "@/hooks/useBookings";
import { useSpaces } from "@/hooks/useSpaces";
import { useAllUsers, useUpdateUser } from "@/hooks/useUsers";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Booking, BookingStatus, Space, SpaceStatus, User } from "@/types";

type AdminTab = "overview" | "users" | "bookings" | "spaces";

const STATUS_MAP: Record<BookingStatus, { label: string; color: string }> = {
  CONFIRMED: { label: "Подтверждено", color: "#4f8ef7" },
  PENDING: { label: "Ожидание", color: "#f59e0b" },
  CANCELLED: { label: "Отменено", color: "#ef4444" },
  COMPLETED: { label: "Завершено", color: "#6b7280" },
  NO_SHOW: { label: "Неявка", color: "#f97316" },
};

const SPACE_STATUS_MAP: Record<SpaceStatus, { label: string; color: string }> = {
  AVAILABLE: { label: "Доступно", color: "#34d399" },
  OCCUPIED: { label: "Занято", color: "#f59e0b" },
  MAINTENANCE: { label: "Обслуживание", color: "#ef4444" },
};

function getUserName(user?: Partial<User> | null) {
  if (!user) {
    return "—";
  }

  if (user.name?.trim()) {
    return user.name;
  }

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return fullName || user.email || "—";
}

function getUserInitials(user: Partial<User>) {
  const name = getUserName(user);

  if (!name || name === "—") {
    return "??";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function displaySpaceName(space: Pick<Space, "name">) {
  return space.name
    .replace("Desk ", "Место ")
    .replace("Meeting Room ", "Переговорная ");
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const meta = STATUS_MAP[status];

  return (
    <span
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "10px",
        fontWeight: 600,
        color: meta.color,
        background: `${meta.color}18`,
        border: `1px solid ${meta.color}35`,
        borderRadius: "6px",
        padding: "2px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {meta.label}
    </span>
  );
}

function SpaceStatusBadge({ status }: { status: SpaceStatus }) {
  const meta = SPACE_STATUS_MAP[status];

  return (
    <span
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "10px",
        fontWeight: 600,
        color: meta.color,
        background: `${meta.color}18`,
        border: `1px solid ${meta.color}35`,
        borderRadius: "6px",
        padding: "2px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {meta.label}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="size-5 animate-spin text-primary/40" />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      className="py-10 text-center"
      style={{ color: "rgba(136,146,164,0.45)", fontFamily: "var(--font-sans)", fontSize: "13px" }}
    >
      {text}
    </div>
  );
}

function OverviewTab({
  users,
  bookings,
  spaces,
  isLoading,
}: {
  users: User[];
  bookings: Booking[];
  spaces: Space[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 86_400_000);
  const todayActive = bookings.filter((booking) =>
    (booking.status === "CONFIRMED" || booking.status === "PENDING") &&
    new Date(booking.startTime) >= todayStart &&
    new Date(booking.startTime) < tomorrowStart,
  ).length;

  const stats = [
    { label: "Пользователей", value: users.length, color: "#4f8ef7", icon: Users },
    { label: "Всего броней", value: bookings.length, color: "#a78bfa", icon: Calendar },
    { label: "Активных сегодня", value: todayActive, color: "#34d399", icon: BarChart3 },
    { label: "Пространств", value: spaces.length, color: "#f59e0b", icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-xl p-5"
            style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="mb-3 flex size-8 items-center justify-center rounded-lg"
              style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}
            >
              <stat.icon className="size-3.5" style={{ color: stat.color }} strokeWidth={1.5} />
            </div>

            <div style={{ fontFamily: "var(--font-tech)", fontSize: "26px", fontWeight: 700, color: "#fff" }}>
              {stat.value}
            </div>

            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "11px",
                color: "rgba(136,146,164,0.65)",
                marginTop: "4px",
              }}
            >
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            letterSpacing: "0.22em",
            color: "#4f8ef7",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Последние бронирования
        </p>

        <div className="space-y-2">
          {bookings.slice(0, 5).map((booking) => (
            <div
              key={booking.id}
              className="flex items-center gap-4 rounded-xl px-4 py-3"
              style={{ background: "rgba(16,20,32,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="min-w-0 flex-1">
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "13px", color: "#e8edf5" }}>
                  {getUserName(booking.user)}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "11px",
                    color: "rgba(136,146,164,0.55)",
                    marginLeft: "8px",
                  }}
                >
                  {displaySpaceName(booking.space)}
                </span>
              </div>

              <span style={{ fontFamily: "var(--font-tech)", fontSize: "11px", color: "rgba(136,146,164,0.5)" }}>
                {format(new Date(booking.startTime), "d MMM HH:mm", { locale: ru })}
              </span>

              <StatusBadge status={booking.status} />
            </div>
          ))}

          {bookings.length === 0 && <EmptyState text="Пока нет бронирований" />}
        </div>
      </div>
    </div>
  );
}

function UsersTab({
  users,
  currentUserId,
  isLoading,
}: {
  users: User[];
  currentUserId: string;
  isLoading: boolean;
}) {
  const updateUser = useUpdateUser();

  const toggleRole = (id: string, current: User["role"]) => {
    const next = current === "ADMIN" ? "USER" : "ADMIN";

    updateUser.mutate(
      { id, role: next },
      {
        onSuccess: () => toast.success(`Роль изменена на ${next}`),
        onError: () => toast.error("Не удалось изменить роль"),
      },
    );
  };

  const adjustRating = (id: string, current: number, delta: number) => {
    const next = Math.max(0, Math.min(5, Math.round((current + delta) * 10) / 10));

    updateUser.mutate(
      { id, rating: next },
      {
        onSuccess: () => toast.success(`Рейтинг обновлён: ${next.toFixed(1)}`),
        onError: () => toast.error("Не удалось обновить рейтинг"),
      },
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (users.length === 0) {
    return <EmptyState text="Пользователи не найдены" />;
  }

  return (
    <div className="space-y-2">
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="flex items-center gap-4 rounded-xl px-4 py-3"
          style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(79,142,247,0.15)", border: "1px solid rgba(79,142,247,0.2)" }}
          >
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "12px", fontWeight: 700, color: "#4f8ef7" }}>
              {getUserInitials(user)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "13px", fontWeight: 600, color: "#e8edf5" }}>
              {getUserName(user)}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "rgba(136,146,164,0.55)" }}>
              {user.email}
            </p>
          </div>

          <button
            onClick={() => toggleRole(user.id, user.role)}
            className="rounded-lg px-2.5 py-1 transition-all hover:opacity-80"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              letterSpacing: "0.12em",
              color: user.role === "ADMIN" ? "#a78bfa" : "rgba(136,146,164,0.6)",
              background: user.role === "ADMIN" ? "rgba(167,139,250,0.12)" : "rgba(136,146,164,0.08)",
              border: `1px solid ${user.role === "ADMIN" ? "rgba(167,139,250,0.3)" : "rgba(136,146,164,0.15)"}`,
            }}
          >
            {user.role}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => adjustRating(user.id, user.rating, -0.5)}
              disabled={user.id === currentUserId}
              className="flex size-6 items-center justify-center rounded-md transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-20"
              style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "rgba(136,146,164,0.6)" }}
            >
              -
            </button>

            <span className="flex items-center justify-center gap-1" style={{ minWidth: "40px" }}>
              <Star className="size-3" style={{ color: "#f59e0b", fill: "#f59e0b" }} />
              <span style={{ fontFamily: "var(--font-tech)", fontSize: "12px", color: "#f59e0b" }}>
                {user.rating.toFixed(1)}
              </span>
            </span>

            <button
              onClick={() => adjustRating(user.id, user.rating, 0.5)}
              disabled={user.id === currentUserId}
              className="flex size-6 items-center justify-center rounded-md transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-20"
              style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "rgba(136,146,164,0.6)" }}
            >
              +
            </button>
          </div>

          <span
            style={{
              fontFamily: "var(--font-tech)",
              fontSize: "10px",
              color: "rgba(136,146,164,0.35)",
              minWidth: "64px",
              textAlign: "right",
            }}
          >
            {format(new Date(user.createdAt), "d MMM yy", { locale: ru })}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function BookingsTab({ bookings, isLoading }: { bookings: Booking[]; isLoading: boolean }) {
  const updateStatus = useUpdateBookingStatus();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "ALL">("ALL");

  const filtered = useMemo(
    () =>
      bookings.filter((booking) => {
        const normalizedSearch = search.trim().toLowerCase();
        const userName = getUserName(booking.user).toLowerCase();
        const userEmail = booking.user?.email?.toLowerCase() ?? "";
        const matchesSearch = !normalizedSearch || userName.includes(normalizedSearch) || userEmail.includes(normalizedSearch);
        const matchesStatus = filterStatus === "ALL" || booking.status === filterStatus;
        return matchesSearch && matchesStatus;
      }),
    [bookings, filterStatus, search],
  );

  const forceCancel = (id: string) => {
    updateStatus.mutate(
      { id, status: "CANCELLED" },
      {
        onSuccess: () => toast.success("Бронирование отменено"),
        onError: () => toast.error("Не удалось изменить статус"),
      },
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Search className="size-3.5 text-primary/40" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по имени или email..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "#e8edf5" }}
          />

          {search && (
            <button onClick={() => setSearch("")}>
              <X className="size-3.5 text-white/30 transition-colors hover:text-white/60" />
            </button>
          )}
        </div>

        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as BookingStatus | "ALL")}>
          <SelectTrigger
            className="h-9 rounded-xl text-xs"
            style={{
              background: "rgba(16,20,32,0.75)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(200,210,230,0.8)",
              minWidth: "160px",
            }}
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="border-white/8 p-1.5" style={{ background: "rgba(16,20,32,0.97)", backdropFilter: "blur(16px)" }}>
            <SelectItem value="ALL" className="rounded-lg text-xs focus:bg-white/8 focus:text-white py-2 px-3 mb-0.5">
              Все статусы
            </SelectItem>
            {(Object.keys(STATUS_MAP) as BookingStatus[]).map((status) => (
              <SelectItem key={status} value={status} className="rounded-lg text-xs focus:bg-white/8 focus:text-white py-2 px-3 mb-0.5">
                {STATUS_MAP[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.map((booking, index) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          className="flex items-center gap-4 rounded-xl px-4 py-3"
          style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="min-w-0 flex-1">
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "13px", color: "#e8edf5" }}>
              {getUserName(booking.user)}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "rgba(136,146,164,0.5)" }}>
              {booking.user?.email ?? "—"}
            </p>
          </div>

          <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "rgba(200,210,230,0.7)", minWidth: "140px" }}>
            {displaySpaceName(booking.space)}
          </span>

          <span style={{ fontFamily: "var(--font-tech)", fontSize: "11px", color: "rgba(136,146,164,0.5)", minWidth: "132px" }}>
            {format(new Date(booking.startTime), "d MMM, HH:mm", { locale: ru })} - {format(new Date(booking.endTime), "HH:mm")}
          </span>

          <StatusBadge status={booking.status} />

          {booking.status === "CONFIRMED" || booking.status === "PENDING" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => forceCancel(booking.id)}
              disabled={updateStatus.isPending}
              className="h-7 flex-shrink-0 rounded-lg px-2.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
              style={{ fontFamily: "var(--font-sans)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              Отменить
            </Button>
          ) : (
            <div className="w-16" />
          )}
        </motion.div>
      ))}

      {filtered.length === 0 && <EmptyState text="Бронирований не найдено" />}
    </div>
  );
}

function SpacesTab({
  spaces,
  isLoading,
  onRefresh,
}: {
  spaces: Space[];
  isLoading: boolean;
  onRefresh: () => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleMaintenance = async (id: string, current: SpaceStatus) => {
    const next: SpaceStatus = current === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";

    try {
      setIsUpdating(true);
      await api.put(`/spaces/${id}`, { status: next });
      toast.success(`Статус изменён: ${SPACE_STATUS_MAP[next].label}`);
      onRefresh();
    } catch {
      toast.error("Не удалось обновить статус пространства");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (spaces.length === 0) {
    return <EmptyState text="Пространства не найдены" />;
  }

  return (
    <div className="space-y-2">
      {spaces.map((space, index) => (
        <motion.div
          key={space.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="flex items-center gap-4 rounded-xl px-4 py-3"
          style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="min-w-0 flex-1">
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "13px", color: "#e8edf5" }}>
              {displaySpaceName(space)}
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "rgba(136,146,164,0.5)", marginTop: "2px" }}>
              {space.type === "DESK" ? "Рабочее место" : `Переговорная · ${space.capacity} чел.`}
            </p>
          </div>

          <SpaceStatusBadge status={space.status} />

          <button
            onClick={() => toggleMaintenance(space.id, space.status)}
            disabled={isUpdating}
            className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              fontFamily: "var(--font-sans)",
              color: space.status === "MAINTENANCE" ? "#34d399" : "#ef4444",
              background: space.status === "MAINTENANCE" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${space.status === "MAINTENANCE" ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`,
            }}
          >
            {space.status === "MAINTENANCE" ? "Вернуть в строй" : "На обслуживание"}
          </button>
        </motion.div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const usersQuery = useAllUsers();
  const bookingsQuery = useAllBookings();
  const spacesQuery = useSpaces();

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [router, user]);

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const hasError = usersQuery.isError || bookingsQuery.isError || spacesQuery.isError;
  const isLoading = usersQuery.isLoading || bookingsQuery.isLoading || spacesQuery.isLoading;

  const tabs: { value: AdminTab; label: string; icon: typeof BarChart3 }[] = [
    { value: "overview", label: "Обзор", icon: BarChart3 },
    { value: "users", label: "Пользователи", icon: Users },
    { value: "bookings", label: "Бронирования", icon: Calendar },
    { value: "spaces", label: "Пространства", icon: Building2 },
  ];

  const renderActiveTab = () => {
    if (hasError) {
      return (
        <div
          className="rounded-2xl p-6"
          style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(239,68,68,0.18)" }}
        >
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "15px", color: "#fff", marginBottom: "8px" }}>
            Не удалось загрузить данные админки
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(136,146,164,0.7)" }}>
            Проверь соединение с API или обнови страницу.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case "users":
        return <UsersTab users={usersQuery.data ?? []} currentUserId={user.id} isLoading={isLoading} />;
      case "bookings":
        return <BookingsTab bookings={bookingsQuery.data ?? []} isLoading={isLoading} />;
      case "spaces":
        return <SpacesTab spaces={spacesQuery.data ?? []} isLoading={isLoading} onRefresh={() => void spacesQuery.refetch()} />;
      case "overview":
      default:
        return (
          <OverviewTab
            users={usersQuery.data ?? []}
            bookings={bookingsQuery.data ?? []}
            spaces={spacesQuery.data ?? []}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen" style={{ background: "#0a0d14" }}>
      <AnimatedGradientBackground />

      <header
        className="sticky top-0 z-50 flex h-14 items-center gap-4 px-6"
        style={{
          background: "rgba(10,13,20,0.85)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="h-8 gap-1.5 rounded-full px-3 text-muted-foreground hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "11px", letterSpacing: "0.12em" }}>Дашборд</span>
        </Button>

        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center gap-2">
          <Shield className="size-3.5 text-[#a78bfa]" />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", color: "#a78bfa" }}>ADMIN</span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>/</span>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "#fff" }}>
            Панель управления
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div
            className="mb-8 inline-flex h-11 gap-1 rounded-[14px] p-1"
            style={{ background: "rgba(16,20,32,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className="flex h-8 items-center gap-1.5 rounded-xl px-5 transition-colors"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "12px",
                  letterSpacing: "0.06em",
                  color: activeTab === tab.value ? "#fff" : "rgba(136,146,164,0.8)",
                  background: activeTab === tab.value ? "rgba(255,255,255,0.08)" : "transparent",
                }}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {renderActiveTab()}
        </motion.div>
      </main>
    </div>
  );
}
