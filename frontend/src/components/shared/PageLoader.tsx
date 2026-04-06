"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DURATION = 2400;

export function PageLoader() {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem("garage_loaded")) return;

    setVisible(true);

    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 2.2);
      setCount(Math.floor(eased * 100));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setCount(100);
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => {
            setVisible(false);
            sessionStorage.setItem("garage_loaded", "1");
          }, 700);
        }, 200);
      }
    };

    requestAnimationFrame(tick);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
          style={{ background: "#0a0d14" }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(79,142,247,0.07) 0%, transparent 70%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12 flex flex-col items-center gap-3"
          >
            <div
              className="flex size-16 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(79,142,247,0.1)",
                border: "1px solid rgba(79,142,247,0.25)",
                boxShadow: "0 0 40px rgba(79,142,247,0.12)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-tech)",
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#4f8ef7",
                  lineHeight: 1,
                }}
              >
                G
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span
                style={{
                  fontFamily: "var(--font-tech)",
                  fontSize: "22px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: "#fff",
                }}
              >
                GARAGE
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  color: "rgba(79,142,247,0.7)",
                }}
              >
                COWORKING
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <div
              className="relative h-px overflow-hidden rounded-full"
              style={{ width: "160px", background: "rgba(255,255,255,0.06)" }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${count}%`,
                  background: "linear-gradient(90deg, rgba(79,142,247,0.5), rgba(167,139,250,0.8))",
                  transition: "width 0.08s linear",
                }}
              />
            </div>

            <span
              style={{
                fontFamily: "var(--font-tech)",
                fontSize: "13px",
                letterSpacing: "0.12em",
                color: "rgba(136,146,164,0.5)",
              }}
            >
              {String(count).padStart(3, "0")}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
