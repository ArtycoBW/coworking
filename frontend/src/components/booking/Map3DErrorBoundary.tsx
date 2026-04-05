"use client";

import React from "react";
import { LayoutGrid } from "lucide-react";

interface Props {
  children: React.ReactNode;
  onFallback: () => void;
}
interface State { hasError: boolean }

export class Map3DErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onFallback();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0d14] gap-4">
          <LayoutGrid className="size-10 text-primary/40" strokeWidth={1} />
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "14px", color: "rgba(136,146,164,0.6)" }}>
            3D недоступен — переключено на 2D
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
