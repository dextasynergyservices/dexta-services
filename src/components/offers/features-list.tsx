"use client";

import { Check } from "lucide-react";

export function FeaturesList({ features }: { features: string[] }) {
  if (!features?.length) return null;

  return (
    <ul className="space-y-3 mb-6">
      {features.map((feature, i) => (
        <li
          key={`${feature}-${i}`}
          className="flex items-start gap-2 text-sm text-gray-300"
        >
          <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          {feature}
        </li>
      ))}
    </ul>
  );
}
