"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function EnhancedCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isOnText, setIsOnText] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement;
      const isInteractive: boolean =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        !!target.closest("button") ||
        !!target.closest("a") ||
        target.getAttribute("data-cursor") === "magnetic";

      const isTextContent: boolean =
        target.tagName === "H1" ||
        target.tagName === "H2" ||
        target.tagName === "H3" ||
        target.tagName === "P" ||
        !!target.closest("h1") ||
        !!target.closest("h2") ||
        !!target.closest("h3") ||
        !!target.closest("p");

      setIsHovering(isInteractive);
      setIsOnText(isTextContent && !isInteractive);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setIsOnText(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Inner circle - responsive to text */}
      <motion.div
        animate={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
          scale: isOnText ? 1.5 : isHovering ? 1.2 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 800,
          damping: 35,
          mass: 0.5,
        }}
        className={`fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[9999] mix-blend-difference transition-colors duration-200 ${
          isOnText
            ? "bg-primary shadow-lg shadow-primary/50"
            : isHovering
              ? "bg-white/80"
              : "bg-white/60"
        }`}
        style={{ backdropFilter: "blur(2px)" }}
      />

      {/* Outer ring - blended effect */}
      <motion.div
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.3 : isOnText ? 1.1 : 1,
          opacity: isHovering ? 1 : isOnText ? 0.7 : 0.5,
        }}
        transition={{
          type: "spring",
          stiffness: 600,
          damping: 40,
          mass: 0.8,
        }}
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border-2 pointer-events-none z-[9998] mix-blend-screen transition-colors duration-200 ${
          isOnText
            ? "border-primary/70 shadow-lg shadow-primary/30"
            : isHovering
              ? "border-white/80 shadow-lg shadow-white/20"
              : "border-white/40"
        }`}
      />

      {/* Hide default cursor */}
      <style>{`
        * {
          // cursor: none !important;
        }
      `}</style>
    </>
  );
}
