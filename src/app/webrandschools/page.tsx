import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import { WeBrandSchoolsPage } from "@/components/we-brand-schools";
import {
  fetchContactPageContent,
  fetchContactSocialLinks,
  fetchSchoolWebsiteTemplates,
  fetchWeBrandSchoolsPageContent,
} from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchWeBrandSchoolsPageContent();

  return {
    title: "We Brand Schools | Dexta Synergy Services",
    description: content.heroBody,
  };
}

export default async function WeBrandSchoolsRoute() {
  const [content, templates, contactContent, socialLinks] = await Promise.all([
    fetchWeBrandSchoolsPageContent(),
    fetchSchoolWebsiteTemplates(),
    fetchContactPageContent(),
    fetchContactSocialLinks(),
  ]);

  return (
    <PageTransition>
      <WeBrandSchoolsPage
        content={content}
        templates={templates}
        contactContent={contactContent}
        socialLinks={socialLinks}
      />
    </PageTransition>
  );
}
