"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Code, Brush, Printer, ArrowRight } from "lucide-react";

const services = [
  {
    id: "01",
    title: "DESIGN",
    description:
      "Visual Domination. We don't just make things pretty — we make them impossible to ignore.",
    icon: <Brush className="w-10 h-10" />,
    color: "text-purple-400",
    gradient: "from-purple-900/40 to-black",
    border: "border-purple-500/30",
    glow: "shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)]",
  },
  {
    id: "02",
    title: "BUILD",
    description:
      "Digital Engineering. Websites and software that work as hard as you do and look better doing it.",
    icon: <Code className="w-10 h-10" />,
    color: "text-cyan-400",
    gradient: "from-cyan-900/40 to-black",
    border: "border-cyan-500/30",
    glow: "shadow-[0_0_50px_-10px_rgba(34,211,238,0.3)]",
  },
  {
    id: "03",
    title: "PRINT",
    description:
      "Ink That Speaks. From paper to billboard, we put your brand in the real world, loud and proud.",
    icon: <Printer className="w-10 h-10" />,
    color: "text-pink-400",
    gradient: "from-pink-900/40 to-black",
    border: "border-pink-500/30",
    glow: "shadow-[0_0_50px_-10px_rgba(236,72,153,0.3)]",
  },
];

export function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const viewportHeight = window.innerHeight;

      // Loop through each card to calculate its "Depth" effect
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        // The transform logic relies on the NEXT card.
        // As the next card rises up (enters viewport), the current card scales down.
        const nextCard = cardsRef.current[index + 1];

        // Default state
        let scale = 1;
        let brightness = 1;
        let translateY = 0;

        if (nextCard) {
          const nextRect = nextCard.getBoundingClientRect();

          // Calculate how far the next card is from the top of the viewport
          // Range: viewportHeight (just started entering) -> 0 (fully covering current card)
          const distanceToTop = nextRect.top;

          // Only apply effect if the next card is currently sliding up over this one
          if (distanceToTop > 0 && distanceToTop <= viewportHeight) {
            // progress goes from 0 (next card at bottom) to 1 (next card at top)
            const progress = 1 - distanceToTop / viewportHeight;

            // Effect: Scale down slightly and darken
            scale = 1 - progress * 0.1; // Scale down to 0.9
            brightness = 1 - progress * 0.5; // Darken by 50%
            translateY = progress * -20; // Move up slightly
          } else if (distanceToTop <= 0) {
            // If next card completely covers this one, keep it in the "background" state
            scale = 0.9;
            brightness = 0.5;
            translateY = -20;
          }
        }

        // Apply transforms to the inner content wrapper, not the sticky container
        const inner = card.querySelector(".card-inner") as HTMLElement;
        if (inner) {
          inner.style.transform = `scale(${scale}) translateY(${translateY}px)`;
          inner.style.filter = `brightness(${brightness})`;
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={containerRef}
      className="bg-black relative pt-16 sm:pt-20 pb-32 sm:pb-40"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-16 sm:mb-24 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
            SERVICES
          </h2>
        </div>

        {/* Stacking Cards Container */}
        <div className="flex flex-col items-center">
          {services.map((service, index) => (
            <div
              key={service.id}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="sticky top-0 h-screen w-full flex items-center justify-center pointer-events-none"
              // 'pointer-events-none' on container allows clicking through if needed,
              // but we re-enable on the card-inner
              style={{ top: "0px" }} // Ensures they stack exactly on top
            >
              <div
                className="card-inner pointer-events-auto w-full max-w-4xl p-[1px] rounded-2xl sm:rounded-3xl lg:rounded-[32px] overflow-hidden transition-transform duration-100 ease-linear will-change-transform"
                style={{ transformOrigin: "top center" }} // Scale from top center for better stacking look
              >
                {/* Gradient Border Wrapper */}
                <div
                  className={`relative h-auto sm:h-[60vh] lg:h-[500px] w-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] bg-[#050505] border border-white/10 overflow-hidden flex flex-col lg:flex-row ${service.glow}`}
                >
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-20`}
                  />

                  {/* Content Left: Info */}
                  <div className="relative z-10 flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div
                          className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 ${service.color}`}
                        >
                          {service.icon}
                        </div>
                        {/* <span className="font-mono text-xs sm:text-sm text-gray-500 tracking-widest">
                          ID_{service.id}
                        </span> */}
                      </div>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
                        {service.title}
                      </h3>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-400 leading-relaxed max-w-md">
                        {service.description}
                      </p>
                    </div>

                    <div
                      className="mt-6 sm:mt-8 flex items-center gap-2 text-xs sm:text-sm font-mono text-gray-500 group cursor-pointer hover:text-white transition-colors"
                      onClick={() =>
                        router.push(
                          `/projects?tab=${service.title.toLowerCase()}`,
                        )
                      }
                    >
                      <span className="uppercase tracking-widest">
                        Explore {service.title}
                      </span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </div>

                  {/* Content Right: Decorative Visuals */}
                  <div className="relative z-10 flex-1 bg-white/5 border-t sm:border-t lg:border-l border-white/10 p-6 sm:p-8 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />

                    {/* Abstract Shape */}
                    <div
                      className={`w-28 h-28 sm:w-40 sm:h-40 lg:w-64 lg:h-64 rounded-full border border-white/10 flex items-center justify-center relative ${service.color}`}
                    >
                      <div className="absolute inset-0 rounded-full border border-current opacity-20 animate-[spin_10s_linear_infinite]" />
                      {service.icon}
                      {/* <Zap className="w-12 h-12 md:w-20 md:h-20 opacity-50" /> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Spacer at bottom to allow the last card to be scrolled past comfortably */}
        <div className="h-[20vh]"></div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </section>
  );
}

// Ensure default export is present to prevent "Element type is invalid" errors
export default ServicesSection;
