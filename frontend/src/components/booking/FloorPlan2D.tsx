"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Space } from "@/types";

interface FloorPlan2DProps {
  spaces: Space[];
  availableIds: string[];
  selectedId: string | null;
  onSelect: (space: Space) => void;
}

const COLS = 5;
const CW = 108;
const CH = 84;
const GX = 16;
const GY = 14;
const PL = 52;
const PT = 56;
const ROOM_H = 90;
const ROOM_GAP = 20;
const SECTION_GAP = 36;
const LABEL_AREA = 28;

const DESK_ROWS = 4;
const W = PL + COLS * (CW + GX) - GX + 24;
const H = LABEL_AREA + ROOM_H + SECTION_GAP + PT + DESK_ROWS * (CH + GY) - GY + 48;

type State = "available" | "occupied" | "selected";

const C: Record<State, { fill: string; stroke: string; labelBg: string; text: string; badge: string; badgeText: string }> = {
  available: {
    fill: "rgba(15,30,68,0.7)",
    stroke: "rgba(79,142,247,0.5)",
    labelBg: "rgba(79,142,247,0.18)",
    text: "#a8c8ff",
    badge: "rgba(79,142,247,0.12)",
    badgeText: "rgba(79,142,247,0.7)",
  },
  occupied: {
    fill: "rgba(40,10,10,0.7)",
    stroke: "rgba(239,68,68,0.4)",
    labelBg: "rgba(239,68,68,0.15)",
    text: "#fca5a5",
    badge: "rgba(239,68,68,0.1)",
    badgeText: "rgba(239,68,68,0.6)",
  },
  selected: {
    fill: "rgba(10,40,22,0.8)",
    stroke: "rgba(52,211,153,0.8)",
    labelBg: "rgba(52,211,153,0.2)",
    text: "#6ee7b7",
    badge: "rgba(52,211,153,0.15)",
    badgeText: "#34d399",
  },
};

function deskPos(i: number) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return {
    x: PL + col * (CW + GX),
    y: LABEL_AREA + ROOM_H + SECTION_GAP + PT + row * (CH + GY),
  };
}

export function FloorPlan2D({ spaces, availableIds, selectedId, onSelect }: FloorPlan2DProps) {
  const [hov, setHov] = useState<string | null>(null);

  const desks = spaces.filter((s) => s.type === "DESK");
  const rooms = spaces.filter((s) => s.type === "MEETING_ROOM");

  const getState = (s: Space): State => {
    if (selectedId === s.id) return "selected";
    if (availableIds.includes(s.id)) return "available";
    return "occupied";
  };

  const roomW = (W - PL - ROOM_GAP - 24) / 2;
  const r1x = PL;
  const r2x = PL + roomW + ROOM_GAP;

  const BADGE_STATUS: Record<State, string> = {
    available: "свободно",
    occupied: "занято",
    selected: "выбрано",
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start overflow-auto py-8 px-6">
      <div
        className="rounded-2xl relative overflow-hidden"
        style={{
          background: "rgba(11,14,22,0.95)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
          width: "100%",
          maxWidth: W + 48,
          padding: "28px 24px 24px",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(79,142,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.3em", color: "#4f8ef7", textTransform: "uppercase" }}>
                Garage Coworking
              </p>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 600, color: "#e8edf5", marginTop: "3px" }}>
                План этажа
              </p>
            </div>
            <div className="flex items-center gap-4">
              {(["available", "occupied", "selected"] as State[]).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-sm" style={{ background: C[s].labelBg, border: `1px solid ${C[s].stroke}` }} />
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "10px", color: "rgba(136,146,164,0.7)" }}>
                    {s === "available" ? "Свободно" : s === "occupied" ? "Занято" : "Выбрано"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "20px" }} />

          {rooms.length > 0 && <div className="mb-2">
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.25em", color: "rgba(124,92,252,0.5)", textTransform: "uppercase", marginBottom: "10px" }}>
              Переговорные комнаты
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {rooms.map((room) => {
                const st = getState(room);
                const col = C[st];
                const isHov = hov === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      if (st === "occupied") { toast.error("Переговорная занята"); return; }
                      onSelect(room);
                    }}
                    onMouseEnter={() => setHov(room.id)}
                    onMouseLeave={() => setHov(null)}
                    style={{
                      background: isHov && st !== "occupied" ? col.fill.replace("0.7", "0.9") : col.fill,
                      border: `1px solid ${col.stroke}`,
                      borderRadius: "12px",
                      padding: "18px 20px",
                      cursor: st === "occupied" ? "not-allowed" : "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                      boxShadow: st === "selected" ? `0 0 16px rgba(52,211,153,0.15)` : st === "available" && isHov ? "0 0 12px rgba(79,142,247,0.1)" : "none",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p style={{ fontFamily: "var(--font-tech)", fontSize: "13px", fontWeight: 600, color: col.text, marginBottom: "4px" }}>
                          {room.name.replace("Meeting Room ", "Переговорная ")}
                        </p>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "rgba(136,146,164,0.6)" }}>
                          {room.capacity} чел · {room.amenities.slice(0, 2).join(", ")}
                        </p>
                      </div>
                      <span style={{
                        background: col.badge,
                        border: `1px solid ${col.stroke}`,
                        borderRadius: "6px",
                        padding: "3px 8px",
                        fontFamily: "var(--font-sans)",
                        fontSize: "10px",
                        color: col.badgeText,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}>
                        {BADGE_STATUS[st]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>}

          {rooms.length > 0 && desks.length > 0 && <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "20px 0" }} />}

          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.25em", color: "rgba(79,142,247,0.5)", textTransform: "uppercase", marginBottom: "14px" }}>
              Рабочие места
            </p>

            <div className="flex gap-3 mb-2" style={{ paddingLeft: "28px" }}>
              {Array.from({ length: COLS }, (_, i) => (
                <div key={i} style={{ width: CW, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(79,142,247,0.3)", letterSpacing: "0.1em" }}>
                  {i + 1}
                </div>
              ))}
            </div>

            {Array.from({ length: DESK_ROWS }, (_, row) => (
              <div key={row} className="flex items-center gap-3 mb-3">
                <div style={{ width: "20px", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(79,142,247,0.35)", textAlign: "center" }}>
                  {String.fromCharCode(65 + row)}
                </div>
                {desks.slice(row * COLS, row * COLS + COLS).map((desk) => {
                  const st = getState(desk);
                  const col = C[st];
                  const isHov = hov === desk.id;
                  const label = desk.name.replace("Desk ", "");
                  return (
                    <button
                      key={desk.id}
                      onClick={() => {
                        if (st === "occupied") { toast.error("Место занято", { description: desk.name }); return; }
                        onSelect(desk);
                      }}
                      onMouseEnter={() => setHov(desk.id)}
                      onMouseLeave={() => setHov(null)}
                      style={{
                        width: CW,
                        height: CH,
                        flexShrink: 0,
                        background: isHov && st !== "occupied" ? col.fill.replace("0.7", "0.9") : col.fill,
                        border: `1px solid ${col.stroke}`,
                        borderRadius: "10px",
                        cursor: st === "occupied" ? "not-allowed" : "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        transition: "all 0.15s ease",
                        boxShadow: st === "selected"
                          ? "0 0 14px rgba(52,211,153,0.15)"
                          : st === "available" && isHov
                          ? "0 0 10px rgba(79,142,247,0.1)"
                          : "none",
                        transform: isHov && st !== "occupied" ? "translateY(-1px)" : "none",
                      }}
                    >
                      <div style={{
                        background: col.labelBg,
                        borderRadius: "6px",
                        padding: "4px 14px",
                        fontFamily: "var(--font-tech)",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: col.text,
                        lineHeight: 1,
                      }}>
                        {label}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "10px",
                        color: col.badgeText,
                        letterSpacing: "0.02em",
                      }}>
                        {BADGE_STATUS[st]}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
