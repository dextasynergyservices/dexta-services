"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { PricingPlan } from "./types";
import { PricingCard } from "./pricing-card";

function PricingToggle({
  isQuarterly,
  onToggle,
}: {
  isQuarterly: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <span
        className={`text-sm font-medium ${!isQuarterly ? "text-white" : "text-gray-500"}`}
      >
        Monthly
      </span>
      <button
        type="button"
        onClick={onToggle}
        className={`relative w-14 h-7 rounded-full transition-colors ${
          isQuarterly ? "bg-cyan-500" : "bg-gray-600"
        }`}
      >
        <div
          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
            isQuarterly ? "translate-x-8" : "translate-x-1"
          }`}
        />
      </button>
      <span
        className={`text-sm font-medium ${isQuarterly ? "text-white" : "text-gray-500"}`}
      >
        Quarterly
      </span>
    </div>
  );
}

export function PricingSection({
  title,
  plans,
  color,
}: {
  title: string;
  plans?: PricingPlan[];
  color: "cyan" | "blue" | "purple";
}) {
  const [isQuarterly, setIsQuarterly] = useState(false);
  const safePlans = plans ?? [];

  return (
    <section className="bg-white text-[#212529] py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {title}
        </motion.h2>

        <PricingToggle
          isQuarterly={isQuarterly}
          onToggle={() => setIsQuarterly((v) => !v)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {safePlans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              isQuarterly={isQuarterly}
              color={color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function SetupPricingSection({
  plans,
  color,
}: {
  plans?: PricingPlan[];
  color: "cyan" | "blue" | "purple";
}) {
  const safePlans = plans ?? [];

  return (
    <section className="bg-white text-[#212529] py-16 sm:py-20 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          SET UP OFFERS
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {safePlans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              isQuarterly={false}
              color={color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
