"use client";

import { useState, useEffect, useCallback } from "react";
import { VideoBackground } from "@/components/landing/VideoBackground";
import { HeroSection } from "@/components/landing/HeroSection";
import { ScrollScene } from "@/components/landing/ScrollScene";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { MarqueeSection } from "@/components/landing/MarqueeSection";
import { ProjectSection } from "@/components/landing/ProjectSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { Navbar } from "@/components/shared/Navbar";
import { Preloader } from "@/components/ui/preloader";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";

export default function Home() {
  const [showPreloader, setShowPreloader] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("garage_preloader_seen");
    if (!seen) setShowPreloader(true);
    setMounted(true);
  }, []);

  const handlePreloaderDone = useCallback(() => {
    sessionStorage.setItem("garage_preloader_seen", "1");
    setShowPreloader(false);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {showPreloader && <Preloader onDone={handlePreloaderDone} />}
      <VideoBackground />
      <Navbar />
      <ScrollIndicator />
      <div style={{ position: "relative", zIndex: 10 }}>
        <HeroSection />
        <ScrollScene />
        <MarqueeSection />
        <FeaturesSection />
        <ProjectSection />
        <CtaSection />
      </div>
    </>
  );
}
