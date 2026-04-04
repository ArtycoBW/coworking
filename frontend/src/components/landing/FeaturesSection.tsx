"use client";

import { motion } from "framer-motion";
import { Wifi, Cpu, Clock, Users, Bot, CalendarCheck } from "lucide-react";

const FEATURES = [
  {
    num: "01",
    icon: Wifi,
    title: "Быстрый интернет",
    desc: "Выделенный канал 10 Гбит/с — стримить, деплоить и рендерить без ограничений.",
    tag: "10 Гбит/с",
    accent: "#4f8ef7",
  },
  {
    num: "02",
    icon: Cpu,
    title: "Мощное железо",
    desc: "RTX 4080, 64 ГБ RAM, NVMe SSD. Рабочие станции для ML, 3D и разработки.",
    tag: "RTX 4080",
    accent: "#a78bfa",
  },
  {
    num: "03",
    icon: Clock,
    title: "Доступ 24/7",
    desc: "Умная карточная система без охраны. Работай в любое время, когда удобно.",
    tag: "Без ограничений",
    accent: "#34d399",
  },
  {
    num: "04",
    icon: Users,
    title: "Переговорные",
    desc: "Оборудованные комнаты для встреч, презентаций и командных сессий.",
    tag: "До 12 человек",
    accent: "#f59e0b",
  },
  {
    num: "05",
    icon: Bot,
    title: "AI-ассистент",
    desc: "Встроенный помощник для бронирования, вопросов и навигации по пространству.",
    tag: "GPT-4o",
    accent: "#4f8ef7",
  },
  {
    num: "06",
    icon: CalendarCheck,
    title: "Онлайн-бронирование",
    desc: "Резервируй место за минуту. Гибкие тарифы: час, день, месяц.",
    tag: "С телефона",
    accent: "#a78bfa",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-5 sm:px-8 lg:px-10">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,17,23,0.3) 0%, rgba(15,17,23,0.65) 50%, rgba(15,17,23,0.3) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl" style={{ zIndex: 10 }}>
        <motion.div
          className="mb-20 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-primary">
            Возможности
          </span>
          <h2
            className="font-[family-name:var(--font-heading)] font-bold text-white"
            style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
          >
            Всё для продуктивной работы
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.22, ease: "easeOut" } }}
              className="group relative overflow-hidden rounded-2xl"
              style={{
                background: "rgba(18,22,34,0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.07)",
                minHeight: "260px",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px transition-opacity duration-500 opacity-50 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)`,
                }}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${f.accent}10, transparent)`,
                }}
              />

              <div className="relative p-6 flex flex-col h-full" style={{ minHeight: "260px" }}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    style={{
                      fontFamily: "var(--font-tech)",
                      fontSize: "16px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      color: f.accent,
                      opacity: 0.85,
                    }}
                  >
                    {f.num}
                  </span>
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      background: `${f.accent}12`,
                      border: `1px solid ${f.accent}22`,
                    }}
                  >
                    <f.icon className="size-4" style={{ color: f.accent }} strokeWidth={1.5} />
                  </div>
                </div>

                <div className="mt-auto space-y-2">
                  <h3
                    style={{
                      fontFamily: "var(--font-tech)",
                      fontSize: "19px",
                      fontWeight: 600,
                      color: "#fff",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-[15px] leading-6"
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "rgba(155,168,195,0.85)",
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
