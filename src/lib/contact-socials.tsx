import type { ComponentType } from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Twitter,
  Youtube,
} from "lucide-react";
import type { ContactSocialPlatform } from "./contact-defaults";

export const CONTACT_SOCIAL_PLATFORM_META: Record<
  ContactSocialPlatform,
  {
    label: string;
    icon: ComponentType<{ className?: string }>;
  }
> = {
  LINKEDIN: {
    label: "LinkedIn",
    icon: Linkedin,
  },
  INSTAGRAM: {
    label: "Instagram",
    icon: Instagram,
  },
  X: {
    label: "Twitter / X",
    icon: Twitter,
  },
  FACEBOOK: {
    label: "Facebook",
    icon: Facebook,
  },
  WHATSAPP: {
    label: "WhatsApp",
    icon: MessageCircle,
  },
  YOUTUBE: {
    label: "YouTube",
    icon: Youtube,
  },
  TIKTOK: {
    label: "TikTok",
    icon: Music2,
  },
};

export const CONTACT_SOCIAL_PLATFORM_OPTIONS = (
  Object.entries(CONTACT_SOCIAL_PLATFORM_META) as Array<
    [ContactSocialPlatform, (typeof CONTACT_SOCIAL_PLATFORM_META)[ContactSocialPlatform]]
  >
).map(([value, meta]) => ({
  value,
  label: meta.label,
}));
