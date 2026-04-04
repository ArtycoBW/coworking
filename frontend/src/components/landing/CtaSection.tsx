"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section id="pricing" className="relative py-40 px-5 sm:px-8 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,17,23,0.7) 0%, rgba(15,17,23,0.88) 100%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 55% at 50% 60%, rgba(79,142,247,0.07) 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "60%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(79,142,247,0.35) 40%, rgba(124,92,252,0.35) 60%, transparent)",
        }}
      />

      <motion.div
        className="relative mx-auto max-w-3xl text-center space-y-8"
        style={{ zIndex: 10 }}
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex justify-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-primary/25"
            style={{
              background: "rgba(79,142,247,0.06)",
              fontFamily: "var(--font-heading)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              lineHeight: 1,
              padding: "7px 16px",
            }}
          >
            <Sparkles className="size-3 shrink-0" />
            Начни сегодня
          </span>
        </div>

        <h2
          className="font-[family-name:var(--font-heading)] font-extrabold text-white"
          style={{
            fontSize: "clamp(36px, 5.5vw, 68px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          Готов начать
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #4f8ef7 0%, #7c5cfc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            работать?
          </span>
        </h2>

        <p className="font-[family-name:var(--font-mono)] text-sm text-muted-foreground leading-7 max-w-sm mx-auto">
          Первый день — бесплатно. Без обязательств.
        </p>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="inline-block"
        >
          <Button
            size="lg"
            nativeButton={false} render={<Link href="/register" />}
            className="rounded-full font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-widest px-10 h-14 shadow-[0_0_32px_rgba(79,142,247,0.4),0_0_64px_rgba(79,142,247,0.2)]"
          >
            Забронировать место
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </motion.div>
      </motion.div>

      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(15,17,23,0.95))",
        }}
      />
    </section>
  );
}
