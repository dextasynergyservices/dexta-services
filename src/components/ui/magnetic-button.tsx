"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./button";

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export function MagneticButton({
  children,
  onClick,
  className,
  size = "default",
  variant = "default",
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    setMousePosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={mousePosition}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
      }}
    >
      <Button
        size={size}
        variant={variant}
        onClick={onClick}
        className={className}
        data-cursor="magnetic"
      >
        {children}
      </Button>
    </motion.div>
  );
}
