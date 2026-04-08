export type HeroContent = {
  id: number;
  backgroundImagePublicId: string | null;
  cardFallbackImagePublicId: string | null;
  eyebrow: string;
  headline: string;
  body: string;
  ctaText: string;
  ctaHref: string;
  stackBadge: string;
  stackTitle: string;
  stackBody: string;
  stackCtaText: string;
  stackCtaHref: string;
  updatedAt: Date;
};

export type HeroCard = {
  id: string;
  position: number;
  href: string;
  imagePublicId: string | null;
  objectPosition: string;
  label: string;
  title: string;
  chip: string;
  badge: string;
  metaTitle: string;
  metaSubtitle: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
};
