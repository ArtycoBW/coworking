"use client";

import { motion } from "framer-motion";
import { ProjectShowcase } from "@/components/ui/project-showcase";

export function ProjectSection() {
  return (
    <section className="relative py-24 px-5 sm:px-8 lg:px-10" style={{ zIndex: 10 }}>
      {/* Semi-transparent bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,17,23,0.6) 0%, rgba(15,17,23,0.75) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* Left — section header */}
          <motion.div
            className="space-y-5 lg:sticky lg:top-24"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-primary">
              Что внутри
            </span>
            <h2
              className="font-[family-name:var(--font-heading)] font-extrabold text-white leading-tight"
              style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
            >
              Всё что нужно
              <br />
              <span className="text-muted-foreground">для работы</span>
            </h2>
            <p className="font-[family-name:var(--font-mono)] text-sm text-muted-foreground leading-7 max-w-xs">
              Современная инфраструктура, удобное бронирование и умный доступ в любое время.
            </p>

            {/* Accent stat blocks */}
            <div className="pt-4 grid grid-cols-2 gap-4">
              {[
                { value: "121", label: "рабочих кадров" },
                { value: "24/7", label: "доступ" },
                { value: "10G", label: "интернет" },
                { value: "∞", label: "возможностей" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl px-4 py-4 border border-white/8"
                  style={{ background: "rgba(22,27,39,0.6)" }}
                >
                  <div className="font-[family-name:var(--font-heading)] text-2xl font-extrabold text-white">
                    {s.value}
                  </div>
                  <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — project showcase list */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ProjectShowcase />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
