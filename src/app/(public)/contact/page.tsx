import type { Metadata } from "next";
import { ContactHero, ContactInfo } from "@/components/contact";
import { PageTransition } from "@/components/layout/page-transition";
import { fetchContactPageContent, fetchContactSocialLinks } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchContactPageContent();

  return {
    title: "Contact Us | Dexta Synergy Services",
    description: `${content.heroBody} ${content.address}`,
  };
}

export default async function ContactPage() {
  const [content, socialLinks] = await Promise.all([
    fetchContactPageContent(),
    fetchContactSocialLinks(),
  ]);

  return (
    <>
      <PageTransition>
        <main>
          <ContactHero content={content} />
          <ContactInfo content={content} socialLinks={socialLinks} />
        </main>
      </PageTransition>
    </>
  );
}
