"use client";

import { motion } from "framer-motion";

interface FloatingElement {
  id: string;
  size: number;
  duration: number;
  delay: number;
  x: number;
  y: number;
  gradient: string;
}

const elements: FloatingElement[] = [
  {
    id: "1",
    size: 120,
    duration: 20,
    delay: 0,
    x: -100,
    y: -100,
    gradient: "from-primary/40 to-blue-400/20",
  },
  {
    id: "2",
    size: 80,
    duration: 25,
    delay: 2,
    x: 100,
    y: 100,
    gradient: "from-cyan-400/30 to-primary/20",
  },
  {
    id: "3",
    size: 100,
    duration: 30,
    delay: 4,
    x: -80,
    y: 120,
    gradient: "from-blue-400/20 to-primary/30",
  },
  {
    id: "4",
    size: 60,
    duration: 28,
    delay: 1,
    x: 120,
    y: -80,
    gradient: "from-primary/25 to-cyan-400/15",
  },
];

export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          initial={{
            x: element.x,
            y: element.y,
            opacity: 0,
          }}
          animate={{
            x: [element.x, element.x + 200, element.x],
            y: [element.y, element.y + 200, element.y],
            opacity: [0, 0.6, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute"
        >
          <div
            className={`bg-gradient-to-br ${element.gradient} rounded-full blur-3xl`}
            style={{
              width: element.size,
              height: element.size,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
