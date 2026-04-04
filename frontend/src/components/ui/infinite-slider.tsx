"use client";

import React, { useRef, CSSProperties } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface InfiniteSliderProps {
  children: React.ReactNode;
  gap?: number;
  /** pixels per second */
  speed?: number;
  reverse?: boolean;
  className?: string;
  fadeWidth?: number;
  pauseOnHover?: boolean;
}

export function InfiniteSlider({
  children,
  gap = 24,
  speed = 50,
  reverse = false,
  className,
  fadeWidth = 120,
  pauseOnHover = false,
}: InfiniteSliderProps) {
  const x = useMotionValue(0);
  const firstRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  useAnimationFrame((_, delta) => {
    if (isPaused.current) return;
    const el = firstRef.current;
    if (!el) return;

    const oneWidth = el.offsetWidth + gap;
    if (oneWidth <= gap) return;

    if (!reverse) {
      const next = x.get() - speed * (delta / 1000);
      x.set(next <= -oneWidth ? next + oneWidth : next);
    } else {
      const next = x.get() + speed * (delta / 1000);
      x.set(next >= oneWidth ? next - oneWidth : next);
    }
  });

  const maskStyle: CSSProperties = {
    maskImage: `linear-gradient(to right, transparent, black ${fadeWidth}px, black calc(100% - ${fadeWidth}px), transparent)`,
    WebkitMaskImage: `linear-gradient(to right, transparent, black ${fadeWidth}px, black calc(100% - ${fadeWidth}px), transparent)`,
  };

  return (
    <div
      className={cn("overflow-hidden w-full", className)}
      style={maskStyle}
      onMouseEnter={() => pauseOnHover && (isPaused.current = true)}
      onMouseLeave={() => pauseOnHover && (isPaused.current = false)}
    >
      <motion.div
        style={{ x, display: "flex" }}
        className="w-max"
      >
        <div ref={firstRef} style={{ display: "flex", gap: `${gap}px`, paddingRight: `${gap}px` }}>
          {children}
        </div>
        <div style={{ display: "flex", gap: `${gap}px`, paddingRight: `${gap}px` }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
