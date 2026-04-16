export type SchoolWebsiteJobStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "LIVE"
  | "DECLINED";

export type SchoolWebsiteDomainChoice = "HAS_DOMAIN" | "NEEDS_DOMAIN";

export type WeBrandSchoolsPageContentData = {
  logoPublicId: string | null;
  heroImagePublicId: string | null;
  heroEyebrow: string;
  heroHeadline: string;
  heroBody: string;
  heroPrimaryCtaText: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaHref: string;
  overviewLabel: string;
  overviewTitle: string;
  overviewBody: string;
  processLabel: string;
  processTitle: string;
  processBody: string;
  processStep1Title: string;
  processStep1Body: string;
  processStep2Title: string;
  processStep2Body: string;
  processStep3Title: string;
  processStep3Body: string;
  processStep4Title: string;
  processStep4Body: string;
  templatesLabel: string;
  templatesTitle: string;
  templatesBody: string;
};

export type SchoolWebsiteTemplateMediaType = "IMAGE" | "VIDEO";

export type SchoolWebsiteTemplateAssetData = {
  id: string;
  publicId: string;
  mediaType: SchoolWebsiteTemplateMediaType;
  thumbnailPublicId: string | null;
  caption: string | null;
  position: number;
};

export type SchoolWebsiteTemplateData = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string | null;
  websiteUrl: string | null;
  highlights: string[];
  coverAssetId: string | null;
  isVisible: boolean;
  position: number;
  assets: SchoolWebsiteTemplateAssetData[];
};

export type SchoolWebsiteApplicationData = {
  templateId: string | null;
  selectedTemplateName: string;
  schoolName: string;
  aboutSchool: string;
  vision: string;
  mission: string;
  coreValues: string;
  officialPhone: string;
  officialEmail: string;
  officialAddress: string;
  officialWebsiteUrl: string | null;
  officialContactName: string | null;
  officialContactRole: string | null;
  officialContactPhone: string | null;
  officialContactEmail: string | null;
  domainChoice: SchoolWebsiteDomainChoice;
  existingDomain: string | null;
  preferredDomain1: string | null;
  preferredDomain2: string | null;
  status: SchoolWebsiteJobStatus;
  adminNotes: string | null;
};

export const WE_BRAND_SCHOOLS_PAGE_CONTENT_DEFAULTS: WeBrandSchoolsPageContentData =
  {
    logoPublicId: null,
    heroImagePublicId: null,
    heroEyebrow: "We Brand Schools",
    heroHeadline: "Free school websites built from proven templates.",
    heroBody:
      "We help schools launch a credible online presence faster by adapting one of our ready-to-deploy website templates to fit their identity, message, and official contact details.",
    heroPrimaryCtaText: "Browse Templates",
    heroPrimaryCtaHref: "#templates",
    heroSecondaryCtaText: "Apply for a Free Website",
    heroSecondaryCtaHref: "#apply",
    overviewLabel: "What It Is",
    overviewTitle: "A faster path to a professional school website.",
    overviewBody:
      "We Brand Schools is Dexta's initiative for helping schools get online with polished, mobile-friendly websites built from approved templates. Schools choose a template, submit their content, and we handle setup through launch.",
    processLabel: "How It Works",
    processTitle: "From template selection to launch in a clear, simple flow.",
    processBody:
      "The process is designed to be easy for school administrators and repeatable for our internal team.",
    processStep1Title: "Choose a template",
    processStep1Body:
      "Browse the available templates and open any one to preview images, videos, and the live experience.",
    processStep2Title: "Submit school details",
    processStep2Body:
      "Share your school profile, vision, mission, core values, and official contact information.",
    processStep3Title: "Confirm domain path",
    processStep3Body:
      "Tell us whether your school already has a domain or needs a preferred domain to be reviewed.",
    processStep4Title: "Review and go live",
    processStep4Body:
      "After review and approval, we prepare the website, complete minor revisions, and move it to launch.",
    templatesLabel: "Website Templates",
    templatesTitle: "Templates schools can preview and apply for.",
    templatesBody:
      "Each template supports a gallery of images and videos, a preview link, and a direct selection flow into the school application form.",
  };

export function parseJsonStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function serializeJsonStringArray(values: string[]): string {
  return JSON.stringify(values);
}
