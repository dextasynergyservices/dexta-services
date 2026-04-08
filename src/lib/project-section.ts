import { normalizeHexColor } from "@/lib/color-utils";

export const PROJECT_SECTION_DEFAULT_CARD_COLORS = {
  DESIGN: "#c084fc",
  BUILD: "#22d3ee",
  PRINT: "#f472b6",
} as const;

const LEGACY_PHASE2_CARD_COLORS = {
  DESIGN: "#000c99",
  BUILD: "#00abff",
  PRINT: "#0057c2",
} as const;

export function getProjectSectionDefaultCardColor(
  type: keyof typeof PROJECT_SECTION_DEFAULT_CARD_COLORS,
) {
  return PROJECT_SECTION_DEFAULT_CARD_COLORS[type];
}

export function resolveProjectSectionCardColor(
  type: keyof typeof PROJECT_SECTION_DEFAULT_CARD_COLORS,
  value: string | null | undefined,
) {
  const fallback = PROJECT_SECTION_DEFAULT_CARD_COLORS[type];
  const normalized = normalizeHexColor(value, fallback);

  return normalized === LEGACY_PHASE2_CARD_COLORS[type] ? fallback : normalized;
}
