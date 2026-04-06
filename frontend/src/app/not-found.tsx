import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Страница не найдена",
};

export default function NotFound() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "#0a0d14" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(79,142,247,0.06) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        {/* 404 number */}
        <div className="relative">
          <span
            style={{
              fontFamily: "var(--font-tech)",
              fontSize: "clamp(80px, 20vw, 140px)",
              fontWeight: 700,
              lineHeight: 1,
              color: "rgba(79,142,247,0.08)",
              letterSpacing: "-0.02em",
              userSelect: "none",
            }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex size-16 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(79,142,247,0.1)",
                border: "1px solid rgba(79,142,247,0.2)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-tech)",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#4f8ef7",
                }}
              >
                G
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-3">
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(18px, 4vw, 24px)",
              fontWeight: 700,
              color: "#e8edf5",
              letterSpacing: "-0.01em",
            }}
          >
            Страница не найдена
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              color: "rgba(136,146,164,0.65)",
              maxWidth: "320px",
              lineHeight: 1.6,
            }}
          >
            Такой страницы не существует или она была перемещена.
          </p>
        </div>

        {/* Divider */}
        <div
          className="h-px"
          style={{ width: "120px", background: "rgba(255,255,255,0.07)" }}
        />

        {/* Action */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 transition-all hover:opacity-80"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: "#4f8ef7",
            background: "rgba(79,142,247,0.1)",
            border: "1px solid rgba(79,142,247,0.2)",
          }}
        >
          На главную
        </Link>

        {/* Label */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            letterSpacing: "0.22em",
            color: "rgba(136,146,164,0.3)",
            textTransform: "uppercase",
          }}
        >
          GARAGE / NOT FOUND
        </span>
      </div>
    </div>
  );
}
