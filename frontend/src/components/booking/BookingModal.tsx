"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Loader2, Banknote } from "lucide-react";
import { useState } from "react";
import { calcTotal, formatPrice, RATES } from "@/lib/pricing";
import type { Space } from "@/types";

interface BookingModalProps {
  space: Space | null;
  startTime: Date | null;
  endTime: Date | null;
  onConfirm: (notes: string) => void;
  onClose: () => void;
  isPending: boolean;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d: Date) {
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function spaceName(space: Space) {
  return space.type === "DESK"
    ? space.name.replace("Desk ", "Рабочее место ")
    : space.name.replace("Meeting Room ", "Переговорная ");
}

export function BookingModal({ space, startTime, endTime, onConfirm, onClose, isPending }: BookingModalProps) {
  const [notes, setNotes] = useState("");

  if (!space || !startTime || !endTime) return null;

  const hours = (endTime.getTime() - startTime.getTime()) / 3_600_000;
  const total = calcTotal(space.type, startTime, endTime);
  const rate = RATES[space.type];

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-md"
        style={{
          background: "rgba(22,27,39,0.97)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px)",
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "var(--font-heading)", fontSize: "18px", color: "#fff" }}>
            Подтвердить бронирование
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: "rgba(15,17,23,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" strokeWidth={1.5} />
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "15px", fontWeight: 600, color: "#fff" }}>
                {spaceName(space)}
              </span>
              <Badge variant="outline" className="ml-auto text-xs border-white/10 text-white/50">
                {space.type === "DESK" ? "Рабочее место" : "Переговорная"}
              </Badge>
            </div>

            {space.type === "MEETING_ROOM" && (
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" strokeWidth={1.5} />
                <span style={{ fontSize: "13px", color: "rgba(136,146,164,0.9)" }}>
                  Вместимость: {space.capacity} человек
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" strokeWidth={1.5} />
              <span style={{ fontSize: "13px", color: "rgba(136,146,164,0.9)" }}>
                {formatDate(startTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" strokeWidth={1.5} />
              <span style={{ fontSize: "13px", color: "rgba(136,146,164,0.9)" }}>
                {formatTime(startTime)} — {formatTime(endTime)}
                <span style={{ color: "rgba(136,146,164,0.5)", marginLeft: "6px" }}>
                  ({hours % 1 === 0 ? hours : hours.toFixed(1)} ч)
                </span>
              </span>
            </div>
          </div>

          <div>
            <label style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "rgba(200,210,230,0.8)", display: "block", marginBottom: "6px" }}>
              Заметки <span style={{ color: "rgba(136,146,164,0.5)", fontWeight: 400 }}>(опционально)</span>
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Нужен дополнительный монитор..."
              rows={3}
              className="bg-[#0f1117]/60 border-white/10 focus:border-primary/50 text-white placeholder:text-white/25 resize-none rounded-xl"
              style={{ fontSize: "13px" }}
            />
          </div>

          <div
            className="rounded-xl px-4 py-3 space-y-2"
            style={{ background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.15)" }}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "12px", color: "rgba(136,146,164,0.6)" }}>
                {rate} ₽/ч × {hours % 1 === 0 ? hours : hours.toFixed(1)} ч
              </span>
              <Banknote className="size-4 text-primary/50" />
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "13px", color: "rgba(136,146,164,0.8)" }}>Итого</span>
              <span style={{ fontFamily: "var(--font-tech)", fontSize: "20px", fontWeight: 700, color: "#4f8ef7" }}>
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isPending}
            style={{ fontFamily: "var(--font-heading)", fontSize: "12px", letterSpacing: "0.08em" }}>
            Отмена
          </Button>
          <Button
            onClick={() => onConfirm(notes)}
            disabled={isPending}
            className="shadow-[0_0_20px_rgba(79,142,247,0.25)]"
            style={{ fontFamily: "var(--font-heading)", fontSize: "12px", letterSpacing: "0.08em" }}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : "Забронировать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
