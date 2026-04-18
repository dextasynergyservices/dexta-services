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
  heroFeature1: string;
  heroFeature2: string;
  heroFeature3: string;
  overviewLabel: string;
  overviewTitle: string;
  overviewBody: string;
  overviewPrimaryCtaText: string;
  overviewPrimaryCtaHref: string;
  overviewSecondaryCtaText: string;
  overviewSecondaryCtaHref: string;
  overviewBenefitsLabel: string;
  overviewBenefit1: string;
  overviewBenefit2: string;
  overviewBenefit3: string;
  overviewBenefit4: string;
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

export type SchoolWebsiteTestimonialData = {
  id: string;
  schoolName: string;
  logoPublicId: string | null;
  quote: string;
  authorName: string;
  authorPosition: string;
  isVisible: boolean;
  position: number;
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
    heroFeature1: "Template-based website build",
    heroFeature2: "Mobile-ready layouts for schools",
    heroFeature3: "Clear path from selection to launch",
    overviewLabel: "What It Is",
    overviewTitle:
      "A FREE WEBSITE for your school. Built, customised, and ready to go live.",
    overviewBody:
      "This Dexta's WeBrandSchools' Offer is a structured to give schools a credible, polished online presence. You choose a website style from our curated collection. We build it entirely around your school — your identity, your content, your brand. You pay ONLY for your domain name and hosting. That's your school's permanent address on the internet. EVERYTHING ELSE IS PROVIDED.",
    overviewPrimaryCtaText: "See available templates",
    overviewPrimaryCtaHref: "#templates",
    overviewSecondaryCtaText: "Ask a question first",
    overviewSecondaryCtaHref: "#help",
    overviewBenefitsLabel: "What schools get",
    overviewBenefit1:
      "A professionally structured website built from an approved template",
    overviewBenefit2:
      "Your school name, content, contact details, and branding applied to the chosen layout",
    overviewBenefit3:
      "A faster rollout path than a full custom website project",
    overviewBenefit4:
      "A credible public-facing platform for information, communication, and visibility",
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

export const SCHOOL_WEBSITE_TESTIMONIAL_DEFAULTS: SchoolWebsiteTestimonialData[] =
  [
    {
      id: "wbs-testimonial-cedar-grove",
      schoolName: "Cedar Grove Academy",
      logoPublicId: null,
      quote:
        "The website gave our school a clearer public face. Parents now understand who we are and how to reach us quickly.",
      authorName: "Mrs. Adaeze Okafor",
      authorPosition: "Proprietress",
      isVisible: true,
      position: 0,
    },
    {
      id: "wbs-testimonial-harbour-heights",
      schoolName: "Harbour Heights College",
      logoPublicId: null,
      quote:
        "We moved from scattered information to one polished school website. The process felt structured, fast, and easy for our team.",
      authorName: "Mr. Tunde Adebayo",
      authorPosition: "School Director",
      isVisible: true,
      position: 1,
    },
    {
      id: "wbs-testimonial-fountain-gate",
      schoolName: "Fountain Gate Schools",
      logoPublicId: null,
      quote:
        "Our new site made admissions details, announcements, and contact information easier to share. Our school now feels properly represented online.",
      authorName: "Mrs. Ifeoma Nwosu",
      authorPosition: "Head of School",
      isVisible: true,
      position: 2,
    },
    {
      id: "wbs-testimonial-sunrise-international",
      schoolName: "Sunrise International Academy",
      logoPublicId: "/images/school-logos/sunrise-international-academy.svg",
      quote:
        "Our parents now meet a website that feels as polished as our school. It quickly improved trust during enquiries and admissions.",
      authorName: "Mrs. Bimpe Adetoro",
      authorPosition: "Proprietress",
      isVisible: true,
      position: 3,
    },
    {
      id: "wbs-testimonial-kingsford-college-lagos",
      schoolName: "Kingsford College Lagos",
      logoPublicId: "/images/school-logos/kingsford-college-lagos.svg",
      quote:
        "The structure was clear from day one. We shared our school details and branding, and Dexta delivered a website we proudly share.",
      authorName: "Mr. Samuel Ekanem",
      authorPosition: "Director of Operations",
      isVisible: true,
      position: 4,
    },
    {
      id: "wbs-testimonial-meadow-hall-preparatory",
      schoolName: "Meadow Hall Preparatory School",
      logoPublicId: "/images/school-logos/meadow-hall-preparatory.svg",
      quote:
        "The website quickly supported admissions, announcements, and parent confidence. It gave our school a more refined digital presence almost immediately.",
      authorName: "Mrs. Zainab Yusuf",
      authorPosition: "Head of School",
      isVisible: true,
      position: 5,
    },
    {
      id: "wbs-testimonial-greenfield-science-academy",
      schoolName: "Greenfield Science Academy",
      logoPublicId: "/images/school-logos/greenfield-science-academy.svg",
      quote:
        "The template-led approach saved us time without feeling generic. The finished website reflects our academic identity and speaks clearly to families.",
      authorName: "Dr. Chinedu Okorie",
      authorPosition: "Academic Director",
      isVisible: true,
      position: 6,
    },
  ];

export function withWeBrandSchoolsPageContentDefaults(
  value?: Partial<WeBrandSchoolsPageContentData> | null,
): WeBrandSchoolsPageContentData {
  const defaults = WE_BRAND_SCHOOLS_PAGE_CONTENT_DEFAULTS;

  return {
    logoPublicId: value?.logoPublicId ?? defaults.logoPublicId,
    heroImagePublicId: value?.heroImagePublicId ?? defaults.heroImagePublicId,
    heroEyebrow: value?.heroEyebrow ?? defaults.heroEyebrow,
    heroHeadline: value?.heroHeadline ?? defaults.heroHeadline,
    heroBody: value?.heroBody ?? defaults.heroBody,
    heroPrimaryCtaText:
      value?.heroPrimaryCtaText ?? defaults.heroPrimaryCtaText,
    heroPrimaryCtaHref:
      value?.heroPrimaryCtaHref ?? defaults.heroPrimaryCtaHref,
    heroSecondaryCtaText:
      value?.heroSecondaryCtaText ?? defaults.heroSecondaryCtaText,
    heroSecondaryCtaHref:
      value?.heroSecondaryCtaHref ?? defaults.heroSecondaryCtaHref,
    heroFeature1: value?.heroFeature1 ?? defaults.heroFeature1,
    heroFeature2: value?.heroFeature2 ?? defaults.heroFeature2,
    heroFeature3: value?.heroFeature3 ?? defaults.heroFeature3,
    overviewLabel: value?.overviewLabel ?? defaults.overviewLabel,
    overviewTitle: value?.overviewTitle ?? defaults.overviewTitle,
    overviewBody: value?.overviewBody ?? defaults.overviewBody,
    overviewPrimaryCtaText:
      value?.overviewPrimaryCtaText ?? defaults.overviewPrimaryCtaText,
    overviewPrimaryCtaHref:
      value?.overviewPrimaryCtaHref ?? defaults.overviewPrimaryCtaHref,
    overviewSecondaryCtaText:
      value?.overviewSecondaryCtaText ?? defaults.overviewSecondaryCtaText,
    overviewSecondaryCtaHref:
      value?.overviewSecondaryCtaHref ?? defaults.overviewSecondaryCtaHref,
    overviewBenefitsLabel:
      value?.overviewBenefitsLabel ?? defaults.overviewBenefitsLabel,
    overviewBenefit1: value?.overviewBenefit1 ?? defaults.overviewBenefit1,
    overviewBenefit2: value?.overviewBenefit2 ?? defaults.overviewBenefit2,
    overviewBenefit3: value?.overviewBenefit3 ?? defaults.overviewBenefit3,
    overviewBenefit4: value?.overviewBenefit4 ?? defaults.overviewBenefit4,
    processLabel: value?.processLabel ?? defaults.processLabel,
    processTitle: value?.processTitle ?? defaults.processTitle,
    processBody: value?.processBody ?? defaults.processBody,
    processStep1Title: value?.processStep1Title ?? defaults.processStep1Title,
    processStep1Body: value?.processStep1Body ?? defaults.processStep1Body,
    processStep2Title: value?.processStep2Title ?? defaults.processStep2Title,
    processStep2Body: value?.processStep2Body ?? defaults.processStep2Body,
    processStep3Title: value?.processStep3Title ?? defaults.processStep3Title,
    processStep3Body: value?.processStep3Body ?? defaults.processStep3Body,
    processStep4Title: value?.processStep4Title ?? defaults.processStep4Title,
    processStep4Body: value?.processStep4Body ?? defaults.processStep4Body,
    templatesLabel: value?.templatesLabel ?? defaults.templatesLabel,
    templatesTitle: value?.templatesTitle ?? defaults.templatesTitle,
    templatesBody: value?.templatesBody ?? defaults.templatesBody,
  };
}

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
