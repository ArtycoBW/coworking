"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

interface NavHeaderProps {
  items: NavItem[];
  className?: string;
}

function NavHeader({ items, className }: NavHeaderProps) {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      className={cn("relative flex w-fit rounded-full p-1", className)}
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
    >
      {items.map((item) => (
        <NavTab key={item.href} href={item.href} setPosition={setPosition}>
          {item.label}
        </NavTab>
      ))}
      <NavCursor position={position} />
    </ul>
  );
}

const NavTab = ({
  children,
  href,
  setPosition,
}: {
  children: React.ReactNode;
  href: string;
  setPosition: React.Dispatch<
    React.SetStateAction<{ left: number; width: number; opacity: number }>
  >;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className="relative z-10 cursor-pointer"
    >
      <Link
        href={href}
        className="inline-flex items-center h-8 px-4 text-white/55 hover:text-white transition-colors duration-150"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "12px",
          fontWeight: 500,
          letterSpacing: "0.02em",
          lineHeight: 1,
        }}
      >
        {children}
      </Link>
    </li>
  );
};

const NavCursor = ({
  position,
}: {
  position: { left: number; width: number; opacity: number };
}) => {
  return (
    <motion.li
      animate={position}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className="absolute z-0 top-1 h-[calc(100%-8px)] rounded-full bg-white/10 pointer-events-none"
    />
  );
};

export { NavHeader };
export type { NavItem };
