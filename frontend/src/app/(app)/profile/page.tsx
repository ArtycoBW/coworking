"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, User as UserIcon, Star, Calendar, Clock, Shield, Loader2, Save, Pencil, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { AnimatedGradientBackground } from "@/components/ui/animated-gradient-background";
import { useMe, useUpdateProfile } from "@/hooks/useUsers";
import { useMyBookings } from "@/hooks/useBookings";

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className="size-4"
          style={{
            color: s <= Math.round(rating) ? "#f59e0b" : "rgba(136,146,164,0.2)",
            fill: s <= Math.round(rating) ? "#f59e0b" : "transparent",
          }}
        />
      ))}
      <span style={{ fontFamily: "var(--font-tech)", fontSize: "14px", fontWeight: 600, color: "#f59e0b", marginLeft: "6px" }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: "Подтверждено", color: "#4f8ef7" },
  PENDING:   { label: "Ожидание",     color: "#f59e0b" },
  CANCELLED: { label: "Отменено",     color: "#ef4444" },
  COMPLETED: { label: "Завершено",    color: "#6b7280" },
  NO_SHOW:   { label: "Неявка",       color: "#f97316" },
};

export default function ProfilePage() {
  const router = useRouter();
  const { user: storeUser, setAuth, token } = useAuthStore();
  const { data: me, isLoading } = useMe();
  const { data: bookings = [] } = useMyBookings();
  const updateProfile = useUpdateProfile();

  const user = me ?? storeUser;

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
    }
  }, [user]);

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const hoursTotal = completedBookings.reduce(
    (acc, b) => acc + (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / 3_600_000,
    0,
  );

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5);

  const handleSave = () => {
    if (!firstName.trim()) { toast.error("Имя не может быть пустым"); return; }
    if (!lastName.trim()) { toast.error("Фамилия не может быть пустой"); return; }
    updateProfile.mutate(
      { firstName: firstName.trim(), lastName: lastName.trim() },
      {
        onSuccess: (updated) => {
          toast.success("Профиль обновлён");
          if (token) setAuth(updated, token);
          setEditing(false);
        },
        onError: () => toast.error("Не удалось сохранить"),
      },
    );
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?"
    : "?";

  const inputClass = "h-10 bg-[#0a0d14] border-white/10 focus:border-primary/50 text-white placeholder:text-white/25 rounded-xl text-sm";

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
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "11px", letterSpacing: "0.12em" }}>Назад</span>
        </Button>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", color: "#4f8ef7" }}>GARAGE</span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>/</span>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "#fff" }}>Профиль</span>
        </div>
      </header>

      <main className="px-6 py-10 max-w-3xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin text-primary/40" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">

            {/* Avatar + basic info */}
            <div className="rounded-2xl p-6 flex items-start gap-6"
              style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
              <div className="size-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(79,142,247,0.3), rgba(167,139,250,0.3))", border: "1px solid rgba(79,142,247,0.3)", boxShadow: "0 0 24px rgba(79,142,247,0.15)" }}>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "#fff" }}>{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 700, color: "#fff" }}>{user?.name}</h2>
                  {user?.role === "ADMIN" && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.15em", color: "#a78bfa" }}>
                      <Shield className="size-2.5" /> ADMIN
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(136,146,164,0.7)" }}>{user?.email}</p>
                <div className="mt-3">
                  <RatingStars rating={user?.rating ?? 5} />
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditing((v) => !v)}
                className="h-8 px-3 rounded-xl gap-1.5 hover:bg-white/5 flex-shrink-0"
                style={{ fontFamily: "var(--font-heading)", fontSize: "11px", color: editing ? "#4f8ef7" : "rgba(136,146,164,0.6)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <Pencil className="size-3" /> {editing ? "Отмена" : "Изменить"}
              </Button>
            </div>

            {/* Edit form */}
            {editing && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                className="rounded-2xl p-5 space-y-4"
                style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(79,142,247,0.2)", backdropFilter: "blur(12px)" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.22em", color: "#4f8ef7", textTransform: "uppercase" }}>
                  Редактирование профиля
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1.5" style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "rgba(136,146,164,0.7)" }}>
                      Имя
                    </label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Иван"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "rgba(136,146,164,0.7)" }}>
                      Фамилия
                    </label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Иванов"
                      className={inputClass}
                    />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={updateProfile.isPending}
                  className="h-9 px-5 rounded-xl gap-2"
                  style={{ background: "rgba(79,142,247,0.85)", fontFamily: "var(--font-heading)", fontSize: "12px", letterSpacing: "0.1em" }}>
                  {updateProfile.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  Сохранить
                </Button>
              </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Calendar, label: "Всего броней", value: String(totalBookings), color: "#4f8ef7" },
                { icon: Clock, label: "Часов проведено", value: hoursTotal % 1 === 0 ? String(hoursTotal) : hoursTotal.toFixed(1), color: "#a78bfa" },
                { icon: UserIcon, label: "Участник с", value: user?.createdAt ? format(new Date(user.createdAt), "MMM yyyy", { locale: ru }) : "—", color: "#34d399" },
              ].map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
                  className="rounded-xl p-4"
                  style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
                  <div className="size-8 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                    <s.icon className="size-3.5" style={{ color: s.color }} strokeWidth={1.5} />
                  </div>
                  <div style={{ fontFamily: "var(--font-tech)", fontSize: "22px", fontWeight: 700, color: "#fff" }}>{s.value}</div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "rgba(136,146,164,0.6)", marginTop: "3px" }}>{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent bookings */}
            {recentBookings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}
                className="rounded-2xl p-5 space-y-3"
                style={{ background: "rgba(16,20,32,0.75)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.22em", color: "#4f8ef7", textTransform: "uppercase" }}>
                  Последние бронирования
                </p>
                <div className="space-y-2">
                  {recentBookings.map((b) => {
                    const s = STATUS_MAP[b.status];
                    const spaceName = b.space.type === "DESK"
                      ? b.space.name.replace("Desk ", "Место ")
                      : b.space.name.replace("Meeting Room ", "Переговорная ");
                    return (
                      <div key={b.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ background: "rgba(10,13,20,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="size-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                          <MapPin className="size-3" style={{ color: s.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p style={{ fontFamily: "var(--font-heading)", fontSize: "12px", color: "#e8edf5" }}>{spaceName}</p>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: "10px", color: "rgba(136,146,164,0.5)" }}>
                            {format(new Date(b.startTime), "d MMM, HH:mm", { locale: ru })} – {format(new Date(b.endTime), "HH:mm")}
                          </p>
                        </div>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600, color: s.color,
                          background: `${s.color}18`, border: `1px solid ${s.color}35`, borderRadius: "6px", padding: "2px 8px" }}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {bookings.length > 5 && (
                  <Button variant="ghost" size="sm" onClick={() => router.push("/history")}
                    className="w-full h-8 rounded-xl text-xs hover:bg-white/5"
                    style={{ fontFamily: "var(--font-sans)", color: "rgba(136,146,164,0.5)" }}>
                    Показать все ({bookings.length})
                  </Button>
                )}
              </motion.div>
            )}

          </motion.div>
        )}
      </main>
    </div>
  );
}
