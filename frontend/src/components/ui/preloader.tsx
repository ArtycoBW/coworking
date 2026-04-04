"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINES = [
  "Инициализация пространства...",
  "Загрузка рабочих станций...",
  "Подключение к сети 10 Гбит/с...",
  "Калибровка RTX 4080...",
  "Добро пожаловать в GARAGE",
];

const BAR_STEPS = [0, 18, 42, 71, 100];

export function Preloader({ onDone }: { onDone: () => void }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let i = 0;
    const advance = () => {
      i++;
      if (i < LINES.length) {
        setLineIndex(i);
        setProgress(BAR_STEPS[i]);
        setTimeout(advance, i === LINES.length - 1 ? 900 : 420);
      } else {
        setTimeout(() => {
          setExiting(true);
          setTimeout(onDone, 750);
        }, 300);
      }
    };

    setProgress(BAR_STEPS[0]);
    setTimeout(advance, 500);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#0f1117",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: "#fff",
              marginBottom: "4px",
            }}
          >
            GARAGE
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(79,142,247,0.7)",
              marginBottom: "56px",
            }}
          >
            ДГТУ · Коворкинг
          </motion.div>

          <div
            style={{
              width: "clamp(220px, 36vw, 380px)",
              height: "1px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "1px",
              overflow: "hidden",
              marginBottom: "18px",
            }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #4f8ef7, #a78bfa)",
                borderRadius: "1px",
              }}
            />
          </div>

          <div
            style={{
              height: "16px",
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={lineIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  color: lineIndex === LINES.length - 1 ? "#4f8ef7" : "rgba(150,160,185,0.7)",
                }}
              >
                {LINES[lineIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          {(["tl", "tr", "bl", "br"] as const).map((c) => (
            <motion.div
              key={c}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "fixed",
                top: c.startsWith("t") ? "24px" : undefined,
                bottom: c.startsWith("b") ? "24px" : undefined,
                left: c.endsWith("l") ? "24px" : undefined,
                right: c.endsWith("r") ? "24px" : undefined,
                width: "20px",
                height: "20px",
                borderTop: c.startsWith("t") ? "1px solid rgba(79,142,247,0.3)" : undefined,
                borderBottom: c.startsWith("b") ? "1px solid rgba(79,142,247,0.3)" : undefined,
                borderLeft: c.endsWith("l") ? "1px solid rgba(79,142,247,0.3)" : undefined,
                borderRight: c.endsWith("r") ? "1px solid rgba(79,142,247,0.3)" : undefined,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
