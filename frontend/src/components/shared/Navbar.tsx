"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavHeader } from "@/components/ui/nav-header";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Возможности", href: "#features" },
  { label: "Как работает", href: "#how" },
  { label: "Тарифы", href: "#pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 hidden lg:flex justify-center pt-4 px-6"
        style={{ zIndex: 50, pointerEvents: "none" }}
      >
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ pointerEvents: "auto" }}
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-500",
            scrolled
              ? "bg-[#0f1117]/85 backdrop-blur-2xl border border-white/10 shadow-[0_8px_40px_rgba(7,10,16,0.6),0_0_0_1px_rgba(255,255,255,0.04),0_0_20px_rgba(79,142,247,0.06)]"
              : "bg-[#161b27]/60 backdrop-blur-xl border border-white/8 shadow-[0_4px_24px_rgba(7,10,16,0.4),0_0_0_1px_rgba(255,255,255,0.03)]"
          )}
        >
          <Link
            href="/"
            className="font-[family-name:var(--font-heading)] text-[13px] font-bold tracking-[0.28em] text-primary hover:text-primary/80 transition-colors px-3 py-1 shrink-0"
          >
            GARAGE
          </Link>

          <div className="w-px h-4 bg-white/10 shrink-0" />

          <NavHeader items={navItems} />

          <div className="w-px h-4 bg-white/10 shrink-0" />

          <div className="flex items-center gap-1.5 pl-1">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/login" />}
              className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-muted-foreground hover:text-white h-8 px-3 rounded-full"
            >
              Войти
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/register" />}
              className="rounded-full font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest h-8 px-4 shadow-[0_0_12px_rgba(79,142,247,0.25)]"
            >
              Регистрация
            </Button>
          </div>
        </motion.nav>
      </header>

      <header
        className="fixed top-0 inset-x-0 flex lg:hidden items-center justify-between px-5 h-14 transition-all duration-500"
        style={{
          zIndex: 50,
          background: scrolled ? "rgba(15,17,23,0.9)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
      >
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-[13px] font-bold tracking-[0.28em] text-primary"
        >
          GARAGE
        </Link>
        <button
          className="text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Меню"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden fixed top-14 inset-x-0 border-t border-white/5 bg-[#0f1117]/95 backdrop-blur-2xl overflow-hidden"
            style={{ zIndex: 50 }}
          >
            <div className="px-5 py-6 space-y-5">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-3 border-t border-white/5">
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/login" />}
                  className="flex-1"
                >
                  Войти
                </Button>
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/register" />}
                  className="flex-1 rounded-full"
                >
                  Регистрация
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
