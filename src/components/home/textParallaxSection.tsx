"use client";

import React, { useEffect, useRef, useState } from "react";

const DEFAULT_TEXT = "IF YOU'VE GOT A VISION, WE'VE GOT THE CREATIVE AUDACITY";

interface TextParallaxSectionProps {
  text?: string;
}

export function TextParallaxSection({ text = DEFAULT_TEXT }: TextParallaxSectionProps) {
  const words = text.split(" ");
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const [activeWordIndex, setActiveWordIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const scrollDist = containerRef.current.offsetHeight - viewportHeight;
      const scrolled = -rect.top;

      let progress = scrolled / scrollDist;
      progress = Math.max(0, Math.min(2, progress));

      const wordCount = words.length;
      const currentWordIndex = Math.floor(progress * (wordCount + 1));

      if (currentWordIndex !== activeWordIndex) {
        setActiveWordIndex(currentWordIndex);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeWordIndex]);

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-white">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div ref={textRef} className="relative z-10 max-w-5xl px-6 text-center">
          <p className="text-4xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight text-primary-text">
            {words.map((word, index) => (
              <span
                key={index}
                className={`transition-all duration-300 ease-in-out ${index < activeWordIndex ? "text-[var(--dexta-primary)]" : ""} ${words[index - 1] === "WEBSITES." ? "mb-8 block" : ""}`}
              >
                {word}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}

export default TextParallaxSection;
