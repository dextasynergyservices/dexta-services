import HeroWrapper from "@/components/home/hero-wrapper";
import ServicesWrapper from "@/components/home/services-wrapper";
import { ContactSection } from "@/components/home/contact-section";
import { FloatingElements } from "@/components/home/floating-elements";
import ManifestoWrapper from "@/components/home/manifesto-wrapper";
import ExpressionsWrapper from "@/components/home/expressions-wrapper";
import { fetchContactPageContent, fetchContactSocialLinks } from "@/lib/api";

export default async function Home() {
  const [contactContent, contactSocialLinks] = await Promise.all([
    fetchContactPageContent(),
    fetchContactSocialLinks(),
  ]);

  return (
    <>
      <FloatingElements />
      <section id="home">
        <HeroWrapper />
      </section>
      <ManifestoWrapper />
      <section id="services">
        <ServicesWrapper />
      </section>
      <section id="expressions">
        <ExpressionsWrapper />
      </section>
      <section id="contact">
        <ContactSection
          content={contactContent}
          socialLinks={contactSocialLinks}
        />
      </section>
    </>
  );
}
