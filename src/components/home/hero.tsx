"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Cpu,
  Globe,
  BarChart3,
  Wifi,
  Printer,
  Code2,
} from "lucide-react";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const textLeftRef = useRef<HTMLDivElement>(null);
  const textRightRef = useRef<HTMLDivElement>(null);

  // State for load animation
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsLoaded(true);

    const handleScroll = () => {
      if (!containerRef.current || !videoContainerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate scroll progress (0 to 1)
      const totalDist = container.offsetHeight - windowHeight;
      const scrolled = -rect.top;

      let progress = Math.max(0, Math.min(1, scrolled / totalDist));

      // --- ANIMATION LOGIC ---

      // 1. Video Transform (Tilt to Flat, Zoom in)
      const startRot = 25;
      const endRot = 0;
      const currentRot = startRot - progress * (startRot - endRot);

      const startScale = 1;
      const endScale = 3.5;
      const currentScale = startScale + progress * (endScale - startScale);

      const startY = 0;
      const endY = -100;
      const currentY = startY + progress * (endY - startY);

      const startZ = 0;
      const endZ = 100;
      const currentZ = startZ + progress * (endZ - startZ);

      if (videoContainerRef.current) {
        videoContainerRef.current.style.transform = `
          perspective(1000px) 
          rotateX(${currentRot}deg) 
          scale(${currentScale}) 
          translateY(${currentY}px)
          translateZ(${currentZ}px)
        `;
        videoContainerRef.current.style.borderRadius = `${Math.max(0, 12 - progress * 12)}px`;
      }

      // 2. Text Explosion (Move out and Fade)
      const textOffset = 500 * progress;
      const textOpacity = 1 - progress * 1.5;
      const textBlur = progress * 20;

      if (textLeftRef.current) {
        textLeftRef.current.style.transform = `translateX(${-textOffset}px)`;
        textLeftRef.current.style.opacity = `${Math.max(0, textOpacity)}`;
        textLeftRef.current.style.filter = `blur(${textBlur}px)`;
      }

      if (textRightRef.current) {
        textRightRef.current.style.transform = `translateX(${textOffset}px)`;
        textRightRef.current.style.opacity = `${Math.max(0, textOpacity)}`;
        textRightRef.current.style.filter = `blur(${textBlur}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-primary-background min-h-screen">
      <section ref={containerRef} className="relative h-[300vh] w-full">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center perspective-container">
          {/* --- MAIN CONTENT LAYER --- */}
          <div className="relative z-10 w-full max-w-[1600px] py-6 px-4 sm:px-6 md:px-12 h-full flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12">
            {/* LEFT TEXT (Title) */}
            <div
              ref={textLeftRef}
              className={`flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-20 pointer-events-none lg:pointer-events-auto will-change-transform`}
            >
              <div
                className={`transition-all duration-1000 ease-out ${isLoaded ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-12 blur-sm"}`}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-md mb-4 sm:mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <span className="text-xs font-mono text-cyan-300 tracking-wider">
                    CREATIVE SYSTEMS
                  </span>
                </div>
              </div>

              <h1
                className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter text-white leading-[0.9] mb-4 sm:mb-6 drop-shadow-2xl transition-all duration-1000 ease-out delay-200 ${isLoaded ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-12 blur-sm"}`}
              >
                WE DON'T DO
                <span className="block text-transparent bg-clip-text bg-primary">
                  ORDINARY
                </span>
              </h1>

              <p
                className={`max-w-md text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 font-light leading-relaxed mb-6 sm:mb-8 transition-all duration-1000 ease-out delay-300 ${isLoaded ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-12 blur-sm"}`}
              >
                Dexta Synergy Services is Port Harcourt's most dangerous
                creative agency. We Design. We Build. We Print. And we make your
                competition nervous.
              </p>

              <div
                className={`flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start transition-all duration-1000 ease-out delay-500 ${isLoaded ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-12 blur-sm"}`}
              >
                <Button className="h-12 sm:h-14 px-6 sm:px-8 rounded-none border border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-mono tracking-widest backdrop-blur-sm transition-all duration-300 group text-sm sm:text-base">
                  Our Work
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="ghost"
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-none border border-white/10 hover:bg-white/5 text-white font-mono tracking-widest text-sm sm:text-base"
                >
                  <Play className="mr-2 w-4 h-4" />
                  Let's Talk
                </Button>
              </div>
            </div>

            {/* CENTER VIDEO / 3D CARD */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div
                ref={videoContainerRef}
                className={`will-change-transform relative w-[90%] sm:w-[70%] md:w-[500px] lg:w-[600px] xl:w-[800px] aspect-video bg-black rounded-lg sm:rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
                style={{
                  transformStyle: "preserve-3d",
                  transform: "perspective(1000px) rotateX(25deg) scale(1)",
                }}
              >
                <div className="absolute inset-0 bg-gray-900">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-80"
                    src="https://cdn.coverr.co/videos/coverr-abstract-blue-lines-4813/1080p.mp4"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                  {/* HUD Elements */}
                  <div className="absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 flex flex-col gap-1 sm:gap-2 items-end text-[9px] sm:text-[10px]">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-500 animate-pulse" />
                      <span className="font-mono text-cyan-500">
                        DEXTA: ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                      <span className="font-mono text-blue-500">CPU: 100%</span>
                    </div>
                  </div>

                  <div className="absolute bottom-3 sm:bottom-4 lg:bottom-6 left-3 sm:left-4 lg:left-6 flex items-center gap-2 sm:gap-4">
                    <div className="h-8 sm:h-10 w-8 sm:w-10 rounded bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                      <Cpu className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-mono">
                        SYSTEM STATUS
                      </span>
                      <span className="text-sm font-bold tracking-widest text-white">
                        ONLINE
                      </span>
                    </div>
                  </div>

                  {/* Scanning Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-scan" />
                </div>
              </div>
            </div>

            {/* RIGHT TEXT (Features) */}
            <div
              ref={textRightRef}
              className={`hidden xl:flex flex-col items-end justify-center space-y-8 z-20 w-64 pointer-events-none xl:pointer-events-auto transition-all duration-1000 ease-out delay-200 will-change-transform ${isLoaded ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-12 blur-sm"}`}
            >
              <FeatureItem
                icon={<Globe />}
                title="DESIGN"
                desc="We make eyes stop and jaws drop"
              />
              <FeatureItem
                icon={<Code2 />}
                title="BUILD"
                desc="Code so clean, your competitors will cry."
              />
              <FeatureItem
                icon={<Printer />}
                title="PRINT"
                desc="Real world. Real ink. Real impact."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CSS for custom animations */}
      <style jsx global>{`
        @keyframes scan {
          0% {
            top: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .perspective-container {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

// // FeatureItem component
function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group text-right">
      <div className="flex items-center justify-end gap-3 mb-2 text-white/80 group-hover:text-cyan-400 transition-colors">
        <span className="text-xs sm:text-sm font-bold font-mono tracking-widest">
          {title}
        </span>
        <div className="w-5 h-5">{icon}</div>
      </div>
      <p className="text-xs text-gray-500 font-mono leading-relaxed max-w-[150px]">
        {desc}
      </p>
    </div>
  );
}
