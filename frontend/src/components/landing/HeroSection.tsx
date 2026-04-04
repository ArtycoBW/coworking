"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { GooeyText } from "@/components/ui/gooey-text-morphing";

const MORPH_WORDS = ["идеи", "проекты", "код", "решения", "стартапы"];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-[8vw] pt-20 pb-20 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(79,142,247,0.10) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 80% 80% at 38% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 38% 50%, black 30%, transparent 100%)",
        }}
      />

      <AnimatedGroup className="relative max-w-4xl space-y-8" preset="blur-slide">
        <div>
          <span
            className="inline-flex items-center gap-2 rounded-full border border-primary/25"
            style={{
              background: "rgba(79,142,247,0.07)",
              fontFamily: "var(--font-heading)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              lineHeight: 1,
              padding: "7px 12px",
            }}
          >
            <span className="size-1.5 rounded-full bg-primary animate-pulse shrink-0" />
            ДГТУ · Коворкинг
          </span>
        </div>

        <h1
          className="font-[family-name:var(--font-heading)] font-extrabold leading-[0.92] tracking-tight text-white"
          style={{ fontSize: "clamp(52px, 8.5vw, 116px)" }}
        >
          Место где
          <br />
          рождаются
        </h1>

        <div className="relative" style={{ height: "clamp(60px, 9.5vw, 130px)" }}>
          <GooeyText
            texts={MORPH_WORDS}
            morphTime={1.2}
            cooldownTime={2.5}
            className="w-full h-full"
            textClassName="font-[family-name:var(--font-heading)] font-extrabold text-primary leading-none tracking-tight"
            textStyle={{
              fontSize: "clamp(52px, 8.5vw, 116px)",
              textShadow: "0 0 48px rgba(79,142,247,0.5)",
            }}
          />
        </div>

        <p
          className="font-[family-name:var(--font-mono)] text-sm leading-7 text-muted-foreground max-w-sm"
          style={{ letterSpacing: "0.025em" }}
        >
          Коворкинг ДГТУ — современное пространство для работы и роста
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/register" />}
            className="rounded-full px-8 h-12 inline-flex items-center justify-center gap-2 shadow-[0_0_28px_rgba(79,142,247,0.38)]"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            Забронировать место
            <ArrowRight className="size-4 shrink-0" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            nativeButton={false}
            render={<Link href="#how" />}
            className="rounded-full h-12 inline-flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            Как это работает
            <ArrowRight className="size-4 shrink-0" />
          </Button>
        </div>
      </AnimatedGroup>
    </section>
  );
}
