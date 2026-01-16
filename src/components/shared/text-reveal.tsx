"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

interface TextRevealProps {
  children: string;
  className?: string;
}

export function TextReveal({ children, className = "" }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "start 20%"],
  });

  // Reveal animation progress
  const yReveal = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacityReveal = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        style={{ y: yReveal, opacity: opacityReveal }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Line-by-line reveal component
interface LineRevealProps {
  children: string;
  className?: string;
  staggerDelay?: number;
}

export function LineReveal({
  children,
  className = "",
  staggerDelay = 0.05,
}: LineRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lines = children.split("\n");

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20, clipPath: "inset(0 0 100% 0)" }}
          whileInView={{
            opacity: 1,
            y: 0,
            clipPath: "inset(0 0 0% 0)",
            transition: {
              duration: 0.6,
              delay: i * staggerDelay,
              ease: "easeOut",
            },
          }}
          viewport={{ once: true, margin: "-100px" }}
        >
          {line || "\n"}
        </motion.div>
      ))}
    </div>
  );
}
