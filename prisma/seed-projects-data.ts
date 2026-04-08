export const serviceContentDefaults = [
  {
    type: "DESIGN" as const,
    title: "DESIGN",
    description:
      "Visual Domination. We don't just make things pretty — we make them impossible to ignore.",
    iconPublicId: null,
    cardColor: "#c084fc",
    overlayColor: "#000c99",
    backgroundImagePublicId: null,
  },
  {
    type: "BUILD" as const,
    title: "BUILD",
    description:
      "Digital Engineering. Websites and software that work as hard as you do and look better doing it.",
    iconPublicId: null,
    cardColor: "#22d3ee",
    overlayColor: "#000c99",
    backgroundImagePublicId: null,
  },
  {
    type: "PRINT" as const,
    title: "PRINT",
    description:
      "Ink That Speaks. From paper to billboard, we put your brand in the real world, loud and proud.",
    iconPublicId: null,
    cardColor: "#f472b6",
    overlayColor: "#000c99",
    backgroundImagePublicId: null,
  },
] as const;

export const projectsHeroDefaults = {
  id: 1,
  eyebrow: "Dexta Project Archive",
  headline:
    "Work that looks sharp, moves with intent, and lands where it matters.",
  body:
    "Explore selected projects across design, build, and print — all curated to show how ideas become real, useful, and memorable.",
  backgroundImagePublicId: null,
  ctaText: "Start a Project",
  ctaHref: "/contact",
} as const;
