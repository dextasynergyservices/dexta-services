"use client";

import type { AudienceConfig } from "./types";
import { motion } from "framer-motion";
import { Building2, GraduationCap, Church } from "lucide-react";

function AudienceIcon({ iconKey }: { iconKey: AudienceConfig["iconKey"] }) {
  switch (iconKey) {
    case "business":
      return <Building2 className="w-8 h-8" />;
    case "schools":
      return <GraduationCap className="w-8 h-8" />;
    case "churches":
      return <Church className="w-8 h-8" />;
  }
}

export function AudienceHero({ config }: { config: AudienceConfig }) {
  const colors = "border-[color:var(--color-secondary-foreground)]/20 text-[color:var(--color-secondary-foreground)]";

  return (
    <section className="relative min-h-[55vh] sm:min-h-[60vh] lg:min-h-[70vh] bg-white text-[#212529] overflow-hidden">
      <div className="absolute inset-0 bg-white" />
      {/* blue accents (no gradientsColors usage) */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[color:var(--color-primary)]/15 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[color:var(--color-secondary-foreground)]/10 blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border bg-white/80 backdrop-blur-md mb-6 ${colors}`}
          >
            <AudienceIcon iconKey={config.iconKey} />
            <span className="text-sm font-medium">{config.id.toUpperCase()}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            {config.title}
          </h1>

          <p className="text-lg sm:text-xl text-gray-600">{config.subtitle}</p>
        </motion.div>
      </div>
    </section>
  );
}


