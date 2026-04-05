"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { format, setHours, setMinutes } from "date-fns";
import { ru } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, LayoutGrid, Box, Search, Loader2,
  Calendar as CalendarIcon, Clock, Users, CheckCircle2, Armchair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingModal } from "@/components/booking/BookingModal";
import { Map3DErrorBoundary } from "@/components/booking/Map3DErrorBoundary";
import { TimeRangePicker } from "@/components/booking/TimeRangePicker";
import { FloorPlan2D } from "@/components/booking/FloorPlan2D";
import { useSpaces, useAvailableSpaces } from "@/hooks/useSpaces";
import { api } from "@/lib/api";
import { calcTotal, formatPrice } from "@/lib/pricing";
import type { Space, SpaceType } from "@/types";

const CoworkingMap3D = dynamic(
  () => import("@/components/booking/CoworkingMap3D").then((m) => m.CoworkingMap3D),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: "#0a0d14" }}>
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
        <Loader2 className="size-12 animate-spin text-primary/40" strokeWidth={1} />
      </div>
      <p style={{ fontFamily: "var(--font-heading)", fontSize: "12px", letterSpacing: "0.2em", color: "rgba(79,142,247,0.5)", textTransform: "uppercase" }}>
        Загрузка карты
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.28em",
      color: "#4f8ef7", textTransform: "uppercase", marginBottom: "10px",
    }}>
      {children}
    </p>
  );
}

function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl p-4 ${className}`}
      style={{
        background: "rgba(22,27,39,0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function BookingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTimeStr, setStartTimeStr] = useState("09:00");
  const [endTimeStr, setEndTimeStr] = useState("11:00");
  const [spaceType, setSpaceType] = useState<SpaceType>("DESK");
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [availabilityParams, setAvailabilityParams] = useState<{
    startTime: string; endTime: string; type: SpaceType;
  } | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: allSpaces = [] } = useSpaces();
  const { data: availableSpaces, isFetching } = useAvailableSpaces(availabilityParams);

  const availableIds = availableSpaces?.map((s) => s.id) ?? allSpaces.map((s) => s.id);
  const displaySpaces = allSpaces.filter((s) => s.type === spaceType);
  const totalCount = displaySpaces.length;
  const freeCount = displaySpaces.filter((s) => availableIds.includes(s.id)).length;


  const getDateTime = useCallback((timeStr: string): Date | null => {
    if (!date) return null;
    const [h, m] = timeStr.split(":").map(Number);
    return setMinutes(setHours(new Date(date), h), m);
  }, [date]);

  const handleCheckAvailability = () => {
    const start = getDateTime(startTimeStr);
    const end = getDateTime(endTimeStr);
    if (!start || !end) { toast.error("Выберите дату"); return; }
    if (end <= start) { toast.error("Время окончания должно быть позже начала"); return; }
    setSelectedSpace(null);
    setAvailabilityParams({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      type: spaceType,
    });
    toast.promise(
      new Promise((res) => setTimeout(res, 800)),
      { loading: "Проверяем доступность...", success: `${freeCount} мест свободно`, error: "Ошибка" }
    );
  };

  const handleSelectSpace = (space: Space) => {
    setSelectedSpace((prev) => (prev?.id === space.id ? null : space));
  };

  const bookMutation = useMutation({
    mutationFn: ({ notes }: { notes: string }) => {
      const start = getDateTime(startTimeStr)!;
      const end = getDateTime(endTimeStr)!;
      return api.post("/bookings", {
        spaceId: selectedSpace!.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        notes: notes || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Место забронировано!", { description: selectedSpace?.name });
      setShowModal(false);
      setSelectedSpace(null);
      setAvailabilityParams(null);
      void queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Ошибка при бронировании");
    },
  });

  const startDt = getDateTime(startTimeStr);
  const endDt = getDateTime(endTimeStr);
  const canBook = !!selectedSpace && !!startDt && !!endDt && !!availabilityParams;

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      <header
        className="sticky top-0 z-50 flex items-center gap-4 px-6 h-14"
        style={{
          background: "rgba(15,17,23,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}
          className="h-8 px-3 gap-1.5 rounded-full text-muted-foreground hover:text-white hover:bg-white/5">
          <ArrowLeft className="size-3.5" />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "11px", letterSpacing: "0.12em" }}>Назад</span>
        </Button>

        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.2em", color: "#4f8ef7" }}>
            GARAGE
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>/</span>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "#fff" }}>
            Бронирование
          </span>
        </div>

        {availabilityParams && (
          <div className="flex items-center gap-3 ml-4">
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)" }}
            >
              <div className="size-1.5 rounded-full bg-[#4f8ef7] animate-pulse" />
              <span style={{ fontFamily: "var(--font-tech)", fontSize: "12px", color: "#4f8ef7" }}>
                {freeCount} / {totalCount} свободно
              </span>
            </div>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(22,27,39,0.8)" }}
          >
            {(["3d", "2d"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="flex items-center gap-1.5 px-3 py-1.5 transition-all duration-150"
                style={{
                  background: viewMode === mode ? "rgba(79,142,247,0.2)" : "transparent",
                  color: viewMode === mode ? "#4f8ef7" : "rgba(136,146,164,0.6)",
                  fontFamily: "var(--font-heading)",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  borderRight: mode === "3d" ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                {mode === "3d" ? <Box className="size-3" /> : <LayoutGrid className="size-3" />}
                {mode.toUpperCase()} ВИД
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-[290px] flex-shrink-0 flex flex-col gap-3 p-4 overflow-y-auto"
          style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}
        >
          <GlassCard>
            <SectionLabel>Тип места</SectionLabel>
            <Tabs value={spaceType} onValueChange={(v) => { setSpaceType(v as SpaceType); setSelectedSpace(null); setAvailabilityParams(null); }}>
              <TabsList className="w-full h-9" style={{ background: "rgba(15,17,23,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <TabsTrigger value="DESK" className="flex-1 gap-1.5 text-xs data-[state=active]:text-white data-[state=active]:bg-primary/20" style={{ fontFamily: "var(--font-heading)" }}>
                  <Armchair className="size-3" /> Рабочее
                </TabsTrigger>
                <TabsTrigger value="MEETING_ROOM" className="flex-1 gap-1.5 text-xs data-[state=active]:text-white data-[state=active]:bg-primary/20" style={{ fontFamily: "var(--font-heading)" }}>
                  <Users className="size-3" /> Переговорная
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </GlassCard>

          <GlassCard style={{ background: "transparent" }}>
            <SectionLabel>Дата</SectionLabel>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => { setDate(d); setAvailabilityParams(null); setSelectedSpace(null); }}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              locale={ru}
              className="p-0 w-full"
            />
          </GlassCard>

          <GlassCard>
            <SectionLabel>Время</SectionLabel>
            <TimeRangePicker
              startTime={startTimeStr}
              endTime={endTimeStr}
              onStartChange={(v) => { setStartTimeStr(v); setAvailabilityParams(null); }}
              onEndChange={(v) => { setEndTimeStr(v); setAvailabilityParams(null); }}
            />
          </GlassCard>

          <Button
            onClick={handleCheckAvailability}
            disabled={isFetching}
            className="w-full h-10 rounded-xl gap-2"
            style={{
              background: isFetching ? "rgba(79,142,247,0.3)" : "rgba(79,142,247,0.9)",
              boxShadow: "0 0 24px rgba(79,142,247,0.2)",
              fontFamily: "var(--font-heading)",
              fontSize: "12px",
              letterSpacing: "0.1em",
            }}
          >
            {isFetching
              ? <><Loader2 className="size-3.5 animate-spin" /> Проверяем...</>
              : <><Search className="size-3.5" /> Проверить доступность</>
            }
          </Button>

          <AnimatePresence>
            {availabilityParams && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard>
                  <SectionLabel>Легенда</SectionLabel>
                  <div className="space-y-2">
                    {[
                      { color: "#4f8ef7", bg: "rgba(79,142,247,0.15)", label: "Свободно" },
                      { color: "#ef4444", bg: "rgba(239,68,68,0.15)", label: "Занято" },
                      { color: "#34d399", bg: "rgba(52,211,153,0.15)", label: "Выбрано" },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-2.5">
                        <div className="size-3 rounded flex-shrink-0" style={{ background: l.bg, border: `1px solid ${l.color}` }} />
                        <span style={{ fontSize: "12px", color: "rgba(200,210,230,0.7)", fontFamily: "var(--font-sans)" }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedSpace && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(26,139,58,0.06)",
                    border: "1px solid rgba(52,211,153,0.25)",
                    boxShadow: "0 0 24px rgba(52,211,153,0.06)",
                  }}
                >
                  <div className="px-4 pt-4 pb-3">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                          {selectedSpace.type === "DESK"
                            ? selectedSpace.name.replace("Desk ", "Рабочее место ")
                            : selectedSpace.name.replace("Meeting Room ", "Переговорная ")}
                        </p>
                        <p style={{ fontSize: "11px", color: "rgba(136,146,164,0.7)", marginTop: "3px" }}>
                          {selectedSpace.type === "DESK" ? "Рабочее место" : `Переговорная · ${selectedSpace.capacity} чел.`}
                        </p>
                        {startDt && endDt && (
                          <p style={{ fontFamily: "var(--font-tech)", fontSize: "13px", fontWeight: 600, color: "#4f8ef7", marginTop: "6px" }}>
                            {formatPrice(calcTotal(selectedSpace.type, startDt, endDt))}
                          </p>
                        )}
                      </div>
                      <CheckCircle2 className="size-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    </div>

                    {date && (
                      <div
                        className="rounded-xl px-3 py-2 mb-3 space-y-1"
                        style={{ background: "rgba(15,17,23,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="size-3 text-primary/60" />
                          <span style={{ fontSize: "11px", color: "rgba(200,210,230,0.7)", fontFamily: "var(--font-sans)" }}>
                            {format(date, "d MMMM yyyy", { locale: ru })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="size-3 text-primary/60" />
                          <span style={{ fontSize: "11px", color: "rgba(200,210,230,0.7)", fontFamily: "var(--font-tech)" }}>
                            {startTimeStr} — {endTimeStr}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => setShowModal(true)}
                      disabled={!canBook}
                      className="w-full h-9 rounded-xl gap-1.5"
                      style={{
                        background: "rgba(22,160,70,0.85)",
                        boxShadow: "0 0 20px rgba(34,197,94,0.15)",
                        fontFamily: "var(--font-heading)",
                        fontSize: "12px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      <CheckCircle2 className="size-3.5" /> Забронировать
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 relative overflow-hidden"
        >
          {!availabilityParams && (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full pointer-events-none"
              style={{
                background: "rgba(22,27,39,0.85)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Search className="size-3.5 text-primary/60" />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "rgba(136,146,164,0.7)" }}>
                Выберите дату и время, затем нажмите «Проверить доступность»
              </span>
            </div>
          )}

          {viewMode === "3d" ? (
            <Map3DErrorBoundary onFallback={() => setViewMode("2d")}>
              <CoworkingMap3D
                spaces={allSpaces}
                availableIds={availableIds}
                selectedId={selectedSpace?.id ?? null}
                onSelect={handleSelectSpace}
              />
            </Map3DErrorBoundary>
          ) : (
            <FloorPlan2D
              spaces={allSpaces}
              availableIds={availableIds}
              selectedId={selectedSpace?.id ?? null}
              onSelect={handleSelectSpace}
            />
          )}
        </motion.main>
      </div>

      {showModal && (
        <BookingModal
          space={selectedSpace}
          startTime={startDt}
          endTime={endDt}
          onConfirm={(notes) => bookMutation.mutate({ notes })}
          onClose={() => setShowModal(false)}
          isPending={bookMutation.isPending}
        />
      )}
    </div>
  );
}
