import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import { WeBrandSchoolsPage } from "@/components/we-brand-schools";
import {
  fetchContactPageContent,
  fetchContactSocialLinks,
  fetchSchoolPortalFeatureCards,
  fetchSchoolPortalSectionContent,
  fetchSchoolWebsiteTestimonials,
  fetchSchoolWebsiteTemplates,
  fetchWeBrandSchoolsPageContent,
} from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchWeBrandSchoolsPageContent();

  return {
    title: "We Brand Schools | Dexta Synergy Services",
    description: content.heroBody,
  };
}

export default async function WeBrandSchoolsRoute() {
  const [
    content,
    testimonials,
    templates,
    portalSectionContent,
    portalCards,
    contactContent,
    socialLinks,
  ] = await Promise.all([
    fetchWeBrandSchoolsPageContent(),
    fetchSchoolWebsiteTestimonials(),
    fetchSchoolWebsiteTemplates(),
    fetchSchoolPortalSectionContent(),
    fetchSchoolPortalFeatureCards(),
    fetchContactPageContent(),
    fetchContactSocialLinks(),
  ]);

  return (
    <PageTransition>
      <WeBrandSchoolsPage
        content={content}
        testimonials={testimonials}
        templates={templates}
        portalSectionContent={portalSectionContent}
        portalCards={portalCards}
        contactContent={contactContent}
        socialLinks={socialLinks}
      />
    </PageTransition>
  );
}
