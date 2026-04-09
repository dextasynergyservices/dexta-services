"use client";

import React, { useEffect, useRef, useState } from "react";

const DEFAULT_TEXT = "IF YOU'VE GOT A VISION, WE'VE GOT THE CREATIVE AUDACITY";

interface TextParallaxSectionProps {
  text?: string;
}

export function TextParallaxSection({
  text = DEFAULT_TEXT,
}: TextParallaxSectionProps) {
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
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <div
          ref={textRef}
          className="relative z-10 max-w-5xl px-6 text-center sm:px-8 md:max-w-4xl md:px-10 lg:max-w-5xl"
        >
          <p className="text-4xl font-black leading-tight tracking-tight text-primary-text sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
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
