"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";

const PHASES = [
  {
    num: "01",
    title: ["Мощное", "железо"],
    sub: "Топовые комплектующие для любых задач",
    accent: "#4f8ef7",
  },
  {
    num: "02",
    title: ["Собирается", "при тебе"],
    sub: "Каждая деталь точно на своём месте",
    accent: "#7c5cfc",
  },
  {
    num: "03",
    title: ["Система", "готова"],
    sub: "Включается и работает с первой секунды",
    accent: "#4f8ef7",
  },
  {
    num: "04",
    title: ["Твой", "инструмент"],
    sub: "Садись и создавай без ограничений",
    accent: "#7c5cfc",
  },
];

export function ScrollScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      const clamped = Math.max(0, Math.min(v, 0.9999));
      setPhase(Math.min(Math.floor(clamped * 4), 3));
      setPhaseProgress((clamped * 4) % 1);
    });
  }, [scrollYProgress]);

  const currentAccent = PHASES[phase].accent;

  return (
    <section ref={containerRef} id="how" className="relative h-[600vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <div className="relative ml-[8vw] max-w-xl" style={{ zIndex: 10 }}>
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: "rgba(15, 17, 23, 0.55)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 0 0 1px rgba(88,105,142,0.12), 0 24px 64px rgba(7,10,16,0.5)",
            }}
          >
            <div
              className="absolute top-0 left-0 w-26 h-24 rounded-full pointer-events-none opacity-30 transition-colors duration-700"
              style={{
                background: `radial-gradient(circle, ${currentAccent}, transparent 70%)`,
                transform: "translate(-30%, -30%)",
              }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, x: -20, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 20, filter: "blur(8px)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col"
                style={{ padding: "32px 32px 0 32px", minHeight: "280px" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-tech)",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "0.18em",
                    color: currentAccent,
                    opacity: 0.8,
                    marginBottom: "48px",
                  }}
                >
                  {PHASES[phase].num}
                </span>

                <div className="mt-auto">
                  <h2
                    className="font-[family-name:var(--font-heading)] font-extrabold text-white leading-[0.92]"
                    style={{ fontSize: "clamp(38px, 4.8vw, 68px)", marginBottom: "16px" }}
                  >
                    {PHASES[phase].title.map((line, i) => (
                      <span key={i} className="block">
                        {i === PHASES[phase].title.length - 1 ? (
                          <span style={{ color: currentAccent }}>{line}</span>
                        ) : (
                          line
                        )}
                      </span>
                    ))}
                  </h2>

                  <p
                    className="text-sm leading-6 text-muted-foreground"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {PHASES[phase].sub}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2.5 px-8 py-6">
              {PHASES.map((p, i) => (
                <div
                  key={i}
                  className="relative h-px rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    width: i === phase ? 32 : i < phase ? 24 : 14,
                    background: "rgba(255,255,255,0.12)",
                  }}
                >
                  {i < phase && (
                    <div className="absolute inset-0" style={{ background: currentAccent }} />
                  )}
                  {i === phase && (
                    <motion.div
                      className="absolute inset-y-0 left-0"
                      style={{ width: `${phaseProgress * 100}%`, background: currentAccent }}
                    />
                  )}
                </div>
              ))}
              <span
                style={{
                  fontFamily: "var(--font-tech)",
                  fontSize: "9px",
                  letterSpacing: "0.2em",
                  color: "rgba(160,172,196,0.4)",
                  marginLeft: "4px",
                }}
              >
                {String(phase + 1).padStart(2, "0")} / 04
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
