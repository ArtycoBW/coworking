"use client";

import { InfiniteSlider } from "@/components/ui/infinite-slider";

const TAGS_TOP = [
  { text: "RTX 4080", accent: "blue" },
  { text: "64 GB RAM", accent: "none" },
  { text: "10 Гбит/с", accent: "purple" },
  { text: "NVMe SSD", accent: "none" },
  { text: "24 / 7", accent: "blue" },
  { text: "GARAGE", accent: "none" },
  { text: "ДГТУ", accent: "purple" },
  { text: "Коворкинг", accent: "none" },
  { text: "Переговорные", accent: "blue" },
  { text: "Умный доступ", accent: "none" },
  { text: "AI-ассистент", accent: "purple" },
  { text: "Бесплатный день", accent: "none" },
] as const;

const TAGS_BOTTOM = [...TAGS_TOP].reverse();

const accentColor = {
  blue: "#4f8ef7",
  purple: "#a78bfa",
  none: "rgba(200,210,230,0.6)",
};

export function MarqueeSection() {
  return (
    <div className="relative py-10 overflow-hidden" style={{ zIndex: 10 }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,17,23,0) 0%, rgba(20,24,38,0.55) 30%, rgba(20,24,38,0.55) 70%, rgba(15,17,23,0) 100%)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(79,142,247,0.25) 30%, rgba(167,139,250,0.25) 70%, transparent 100%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(79,142,247,0.18) 30%, rgba(167,139,250,0.18) 70%, transparent 100%)",
        }}
      />

      <InfiniteSlider gap={48} speed={36} fadeWidth={120} className="mb-5 relative">
        {TAGS_TOP.map(({ text, accent }) => (
          <div key={text} className="flex items-center gap-10 shrink-0">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: accentColor[accent],
                whiteSpace: "nowrap",
              }}
            >
              {text}
            </span>
            <span
              style={{
                fontSize: "5px",
                borderRadius: "50%",
                width: "4px",
                height: "4px",
                display: "inline-block",
                background:
                  accent === "none"
                    ? "rgba(120,130,155,0.35)"
                    : accent === "blue"
                    ? "rgba(79,142,247,0.5)"
                    : "rgba(167,139,250,0.5)",
                flexShrink: 0,
              }}
            />
          </div>
        ))}
      </InfiniteSlider>

      <InfiniteSlider gap={48} speed={28} reverse fadeWidth={120} className="relative">
        {TAGS_BOTTOM.map(({ text, accent }) => (
          <div key={text} className="flex items-center gap-10 shrink-0">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: accentColor[accent],
                whiteSpace: "nowrap",
                opacity: 0.85,
              }}
            >
              {text}
            </span>
            <span
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                display: "inline-block",
                flexShrink: 0,
                background:
                  accent === "none"
                    ? "rgba(120,130,155,0.3)"
                    : accent === "blue"
                    ? "rgba(79,142,247,0.45)"
                    : "rgba(167,139,250,0.45)",
              }}
            />
          </div>
        ))}
      </InfiniteSlider>
    </div>
  );
}
