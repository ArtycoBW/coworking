"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

interface Project {
  title: string;
  description: string;
  tag: string;
  link: string;
  image: string;
}

const projects: Project[] = [
  {
    title: "Онлайн-бронирование",
    description: "Забронируй рабочее место или переговорную за 30 секунд.",
    tag: "Продукт",
    link: "/register",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=560&auto=format&fit=crop&q=80",
  },
  {
    title: "Умная карточная система",
    description: "Бесконтактный доступ в пространство 24 часа в сутки, 7 дней в неделю.",
    tag: "Инфраструктура",
    link: "/register",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=560&auto=format&fit=crop&q=80",
  },
  {
    title: "Игровые ПК",
    description: "RTX 4080, 64GB RAM, NVMe SSD — мощность без компромиссов.",
    tag: "Оборудование",
    link: "/register",
    image:
      "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=560&auto=format&fit=crop&q=80",
  },
  {
    title: "AI-ассистент",
    description: "Встроенный чат-бот помогает с бронированием и навигацией.",
    tag: "AI",
    link: "/register",
    image:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=560&auto=format&fit=crop&q=80",
  },
];

export function ProjectShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRect = useRef<DOMRect | null>(null);

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.14),
        y: lerp(prev.y, mousePosition.y, 0.14),
      }));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mousePosition]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerRect.current = rect;
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full"
    >
      <div
        className="pointer-events-none fixed z-50 overflow-hidden rounded-xl shadow-2xl"
        style={{
          left: containerRect.current?.left ?? 0,
          top: containerRect.current?.top ?? 0,
          transform: `translate3d(${smoothPosition.x + 24}px, ${smoothPosition.y - 110}px, 0)`,
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? "1" : "0.85",
          transition:
            "opacity 0.25s cubic-bezier(0.4,0,0.2,1), scale 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="relative w-[280px] h-[170px] overflow-hidden rounded-xl">
          {projects.map((project, index) => (
            <img
              key={project.title}
              src={project.image}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-400"
              style={{
                opacity: hoveredIndex === index ? 1 : 0,
                filter: hoveredIndex === index ? "none" : "blur(8px)",
                transform: `scale(${hoveredIndex === index ? 1 : 1.08})`,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117]/40 to-transparent" />
        </div>
      </div>

      <div className="space-y-0">
        {projects.map((project, index) => (
          <a
            key={project.title}
            href={project.link}
            className="group block"
            onMouseEnter={() => {
              setHoveredIndex(index);
              setIsVisible(true);
            }}
            onMouseLeave={() => {
              setHoveredIndex(null);
              setIsVisible(false);
            }}
          >
            <div className="relative py-5 border-t border-white/8">
              <div
                className={`absolute inset-0 -mx-4 rounded-xl transition-all duration-300 ${
                  hoveredIndex === index
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95"
                }`}
                style={{ background: "rgba(79,142,247,0.05)" }}
              />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-2">
                    <h3 className="font-[family-name:var(--font-heading)] text-white font-semibold text-lg tracking-tight relative">
                      <span className="relative">
                        {project.title}
                        <span
                          className={`absolute left-0 -bottom-0.5 h-px bg-primary transition-all duration-300 ${
                            hoveredIndex === index ? "w-full" : "w-0"
                          }`}
                        />
                      </span>
                    </h3>
                    <ArrowUpRight
                      className={`size-4 text-primary transition-all duration-300 ${
                        hoveredIndex === index
                          ? "opacity-100 translate-x-0 translate-y-0"
                          : "opacity-0 -translate-x-2 translate-y-2"
                      }`}
                    />
                  </div>
                  <p
                    className={`font-[family-name:var(--font-mono)] text-sm mt-1 leading-relaxed transition-colors duration-300 ${
                      hoveredIndex === index
                        ? "text-white/65"
                        : "text-muted-foreground"
                    }`}
                  >
                    {project.description}
                  </p>
                </div>

                <span
                  className={`font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all duration-300 ${
                    hoveredIndex === index
                      ? "border-primary/30 text-primary bg-primary/8"
                      : "border-white/10 text-muted-foreground"
                  }`}
                  style={
                    hoveredIndex === index
                      ? { background: "rgba(79,142,247,0.08)" }
                      : {}
                  }
                >
                  {project.tag}
                </span>
              </div>
            </div>
          </a>
        ))}
        <div className="border-t border-white/8" />
      </div>
    </div>
  );
}
