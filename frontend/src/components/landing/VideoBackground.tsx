"use client";

import { useEffect, useRef, useState } from "react";

const FIRST_BATCH = 15;

export function VideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef(0);
  const lastDrawnRef = useRef(-1);
  const rafRef = useRef<number | null>(null);
  const totalRef = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    fetch("/frames/manifest.json")
      .then((r) => r.json())
      .then(({ frames, count }: { frames: string[]; count: number }) => {
        if (!alive) return;
        totalRef.current = count;
        const imgs: (HTMLImageElement | null)[] = new Array(count).fill(null);
        imagesRef.current = imgs;

        let loaded = 0;
        const batch = Math.min(FIRST_BATCH, count);

        frames.slice(0, batch).forEach((name: string, i: number) => {
          const img = new Image();
          img.onload = () => {
            imgs[i] = img;
            loaded++;
            if (loaded >= batch && alive) {
              setReady(true);
              frames.slice(batch).forEach((n: string, j: number) => {
                const img2 = new Image();
                img2.onload = () => {
                  imgs[batch + j] = img2;
                };
                img2.src = `/frames/${n}`;
              });
            }
          };
          img.onerror = () => {
            loaded++;
            if (loaded >= batch && alive) setReady(true);
          };
          img.src = `/frames/${name}`;
        });
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      lastDrawnRef.current = -1;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const onScroll = () => {
      const sy = window.scrollY;
      const maxSY = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(sy / maxSY, 1);
      const total = totalRef.current;
      currentFrameRef.current = Math.min(Math.round(progress * (total - 1)), total - 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const drawCover = (img: HTMLImageElement) => {
      if (!canvas || !ctx || !img.naturalWidth) return;
      const sx = canvas.width / img.naturalWidth;
      const sy = canvas.height / img.naturalHeight;
      const scale = Math.max(sx, sy);
      const dx = (canvas.width - img.naturalWidth * scale) / 2;
      const dy = (canvas.height - img.naturalHeight * scale) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, dx, dy, img.naturalWidth * scale, img.naturalHeight * scale);
    };

    const tick = () => {
      const idx = currentFrameRef.current;
      if (idx !== lastDrawnRef.current) {
        const imgs = imagesRef.current;
        let found: HTMLImageElement | null = null;
        for (let d = 0; d <= idx; d++) {
          const candidate = imgs[idx - d];
          if (candidate?.complete && candidate.naturalWidth > 0) {
            found = candidate;
            break;
          }
        }
        if (found) {
          drawCover(found);
          lastDrawnRef.current = idx;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", setSize);
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          display: ready ? "block" : "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 17, 23, 0.60)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 20%, rgba(15,17,23,0.78) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
