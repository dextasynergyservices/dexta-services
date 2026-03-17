"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PricingPlan } from "./types";
import { FeaturesList } from "./features-list";

export function PricingCard({
  plan,
  isQuarterly,
  color,
}: {
  plan: PricingPlan;
  isQuarterly: boolean;
  color: "cyan" | "blue" | "purple";
}) {
  const price = isQuarterly ? plan.priceQuarterly : plan.priceMonthly;
  const nairaPrice = isQuarterly
    ? plan.priceQuarterlyNaira
    : plan.priceMonthlyNaira;

  const colorClasses: Record<typeof color, string> = {
    cyan: "border-cyan-500/50 bg-cyan-500/10",
    blue: "border-blue-500/50 bg-blue-500/10",
    purple: "border-purple-500/50 bg-purple-500/10",
  };

  return (
    <motion.div
      className={`relative p-6 rounded-2xl border transition-all duration-300 ${
        plan.highlighted
          ? `${colorClasses[color]} scale-[1.02]`
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-500 text-xs font-bold text-black">
          POPULAR
        </div>
      )}

      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

      {plan.reachCount && (
        <p className="text-sm text-gray-400 mb-4">
          Reach up to {plan.reachCount}
        </p>
      )}

      <div className="mb-6">
        <div className="text-3xl font-bold text-white">{nairaPrice}</div>
        <div className="text-sm text-gray-500">
          {price} / {isQuarterly ? "quarter" : "month"}
        </div>
      </div>

      <FeaturesList features={plan.features} />

      <Link href="/contact">
        <Button
          className={`w-full h-12 rounded-lg font-medium ${
            plan.highlighted
              ? "bg-cyan-500 hover:bg-cyan-600 text-black"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          Contact Us
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </Link>
    </motion.div>
  );
}
