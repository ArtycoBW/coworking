"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, LayoutDashboard, Calendar, Clock, Wifi, Users } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

const STATS = [
  { label: "Активных броней", value: "0", icon: Calendar, color: "#4f8ef7" },
  { label: "Часов в этом месяце", value: "0", icon: Clock, color: "#a78bfa" },
  { label: "Свободных мест", value: "22", icon: Users, color: "#34d399" },
  { label: "Скорость сети", value: "10 Гбит", icon: Wifi, color: "#f59e0b" },
];

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b"
        style={{
          background: "rgba(15,17,23,0.9)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: "#4f8ef7",
          }}
        >
          GARAGE
        </span>

        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(136,146,164,0.8)" }}>
            {user?.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 px-3 rounded-full text-muted-foreground hover:text-white"
          >
            <LogOut className="size-3.5 mr-1.5" />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "11px", letterSpacing: "0.12em" }}>
              Выйти
            </span>
          </Button>
        </div>
      </header>

      <main className="px-6 py-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="size-4 text-primary" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.25em", color: "#4f8ef7", textTransform: "uppercase" }}>
              Dashboard
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, color: "#fff" }}>
            Привет, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "rgba(136,146,164,0.8)", marginTop: "6px" }}>
            Добро пожаловать в Garage Coworking
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="rounded-xl p-5"
              style={{
                background: "rgba(22,27,39,0.7)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <s.icon className="size-4" style={{ color: s.color }} strokeWidth={1.5} />
                <span style={{ fontFamily: "var(--font-tech)", fontSize: "22px", fontWeight: 600, color: "#fff", letterSpacing: "0.04em" }}>
                  {s.value}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "rgba(136,146,164,0.7)" }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
          style={{
            background: "rgba(22,27,39,0.5)",
            border: "1px solid rgba(255,255,255,0.07)",
            minHeight: "240px",
          }}
        >
          <Calendar className="size-8 text-primary/40 mb-4" strokeWidth={1} />
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
            Нет активных броней
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(136,146,164,0.5)", marginTop: "6px" }}>
            Забронируй рабочее место или переговорную
          </p>
          <Button
            className="mt-6 rounded-full shadow-[0_0_20px_rgba(79,142,247,0.25)]"
            style={{ fontFamily: "var(--font-heading)", fontSize: "12px", letterSpacing: "0.1em" }}
            onClick={() => router.push("/booking")}
          >
            Забронировать
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
