"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollIndicator() {
  const [visible, setVisible] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2200);

    const onScroll = () => {
      const sy = window.scrollY;
      const maxSY = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      setAtBottom(sy / maxSY > 0.92);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && !atBottom && (
        <motion.div
          key="scroll-indicator"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            pointerEvents: "none",
          }}
        >
          <svg width="22" height="36" viewBox="0 0 22 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="19" height="33" rx="9.5" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
            <line x1="11" y1="3" x2="11" y2="11" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <motion.rect
              x="9" y="6" width="4" height="7" rx="2"
              fill="#4f8ef7"
              animate={{ y: [6, 15, 6], opacity: [0.9, 0.1, 0.9] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.3 }}
            />
          </svg>

          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
            }}
          >
            Scroll
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
