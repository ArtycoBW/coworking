"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, X } from "lucide-react";

interface TimeRangePickerProps {
  startTime: string;
  endTime: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}

function generateSlots() {
  const slots: string[] = [];
  for (let h = 8; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

const ALL_SLOTS = generateSlots();

function toMins(t: string) {
  if (!t) return -1;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function TimeRangePicker({ startTime, endTime, onStartChange, onEndChange }: TimeRangePickerProps) {
  const [picking, setPicking] = useState<"start" | "end">("start");

  const startMin = toMins(startTime);
  const endMin = toMins(endTime);

  const handleClick = (slot: string) => {
    const slotMin = toMins(slot);
    if (picking === "start") {
      onStartChange(slot);
      onEndChange("");
      setPicking("end");
    } else {
      if (slotMin <= startMin) {
        onStartChange(slot);
        onEndChange("");
        setPicking("end");
      } else {
        onEndChange(slot);
        setPicking("start");
      }
    }
  };

  const reset = () => {
    onStartChange("");
    onEndChange("");
    setPicking("start");
  };

  const duration = startTime && endTime
    ? ((endMin - startMin) / 60).toFixed(1) + " ч"
    : null;

  return (
    <div className="space-y-3">
      {(startTime || endTime) && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl px-3 py-2"
          style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)" }}
        >
          <div className="flex items-center gap-3">
            <Clock className="size-3.5 text-primary/70" />
            <span style={{ fontFamily: "var(--font-tech)", fontSize: "14px", color: "#e8edf5" }}>
              {startTime || "—"}{" "}
              <span style={{ color: "rgba(136,146,164,0.5)" }}>→</span>{" "}
              {endTime || "—"}
            </span>
            {duration && (
              <span
                className="px-2 py-0.5 rounded-full"
                style={{ background: "rgba(79,142,247,0.2)", fontFamily: "var(--font-tech)", fontSize: "11px", color: "#4f8ef7" }}
              >
                {duration}
              </span>
            )}
          </div>
          <button onClick={reset} className="text-white/30 hover:text-white/70 transition-colors">
            <X className="size-3.5" />
          </button>
        </motion.div>
      )}

      <div
        className="rounded-xl p-2"
        style={{ background: "rgba(15,17,23,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-between px-1 mb-2">
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "10px", color: "rgba(136,146,164,0.5)" }}>
            {picking === "start" ? "▶ Выберите начало" : "▶ Выберите конец"}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {ALL_SLOTS.map((slot) => {
            const slotMin = toMins(slot);
            const isStart = slot === startTime;
            const isEnd = slot === endTime;
            const inRange = startTime && endTime && slotMin > startMin && slotMin < endMin;
            const isDisabled = picking === "end" && slotMin <= startMin;

            let bg = "rgba(22,27,39,0.6)";
            let border = "rgba(255,255,255,0.06)";
            let color = "rgba(136,146,164,0.6)";

            if (isStart || isEnd) {
              bg = "rgba(79,142,247,0.8)";
              border = "#4f8ef7";
              color = "#fff";
            } else if (inRange) {
              bg = "rgba(79,142,247,0.15)";
              border = "rgba(79,142,247,0.3)";
              color = "#7eb3fa";
            } else if (isDisabled) {
              bg = "rgba(15,17,23,0.3)";
              border = "rgba(255,255,255,0.03)";
              color = "rgba(136,146,164,0.2)";
            }

            return (
              <motion.button
                key={slot}
                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                disabled={isDisabled}
                onClick={() => !isDisabled && handleClick(slot)}
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: "7px",
                  padding: "5px 2px",
                  color,
                  fontFamily: "var(--font-tech)",
                  fontSize: "11px",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {slot}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
