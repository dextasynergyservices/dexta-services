"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Detect hover over interactive elements
    const handleMouseOverInteractive = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.tagName === "A" ||
        target.closest("a") ||
        target.getAttribute("data-cursor") === "magnetic"
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseOutInteractive = () => {
      setIsHovering(false);
    };

    document.addEventListener("mouseover", handleMouseOverInteractive);
    document.addEventListener("mouseout", handleMouseOutInteractive);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleMouseOverInteractive);
      document.removeEventListener("mouseout", handleMouseOutInteractive);
    };
  }, []);

  return (
    <>
      {/* Main cursor circle */}
      <motion.div
        className="fixed w-8 h-8 border-2 border-primary rounded-full pointer-events-none z-[9999] hidden md:block"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? "rgba(0, 178, 255, 0.1)" : "transparent",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
        style={{
          opacity: isVisible ? 1 : 0,
        }}
      />

      {/* Outer ring (flashlight effect) */}
      <motion.div
        className="fixed w-16 h-16 border border-primary/30 rounded-full pointer-events-none z-[9998] hidden md:block"
        animate={{
          x: mousePosition.x - 32,
          y: mousePosition.y - 32,
          scale: isHovering ? 1.2 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        style={{
          opacity: isVisible ? 0.5 : 0,
        }}
      />

      {/* Hide default cursor */}
      <style>{`
        html {
          cursor: none;
        }
        html.no-custom-cursor {
          cursor: auto;
        }
      `}</style>
    </>
  );
}
