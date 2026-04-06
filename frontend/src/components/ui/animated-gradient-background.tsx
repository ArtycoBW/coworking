"use client";

import { useEffect, useRef } from "react";

export function AnimatedGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const orbs = [
      { x: 0.2, y: 0.15, r: 0.45, color: "79,90,247", speed: 0.00035 },
      { x: 0.78, y: 0.2,  r: 0.38, color: "120,60,220", speed: 0.00028 },
      { x: 0.5,  y: 0.7,  r: 0.42, color: "30,80,200", speed: 0.00022 },
      { x: 0.15, y: 0.75, r: 0.3,  color: "80,40,180", speed: 0.00040 },
      { x: 0.85, y: 0.65, r: 0.32, color: "60,120,240", speed: 0.00018 },
    ];

    const draw = () => {
      t++;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0a0d14";
      ctx.fillRect(0, 0, W, H);

      for (const orb of orbs) {
        const ox = (orb.x + Math.sin(t * orb.speed * 1.7) * 0.12) * W;
        const oy = (orb.y + Math.cos(t * orb.speed * 1.3) * 0.10) * H;
        const breathe = 1 + Math.sin(t * orb.speed * 3) * 0.18;
        const r = orb.r * Math.min(W, H) * breathe;

        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
        grad.addColorStop(0,   `rgba(${orb.color},0.18)`);
        grad.addColorStop(0.4, `rgba(${orb.color},0.07)`);
        grad.addColorStop(1,   `rgba(${orb.color},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // subtle grid
      ctx.strokeStyle = "rgba(255,255,255,0.022)";
      ctx.lineWidth = 1;
      const gSize = 64;
      for (let x = 0; x < W; x += gSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
