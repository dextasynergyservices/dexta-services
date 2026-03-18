import { Footer } from "@/components/home/footer";
import { PageTransition } from "@/components/layout/page-transition";
import {
  ServicesHero,
  ServicesGrid,
  AudienceSection,
} from "@/components/services";

export const metadata = {
  title: "Our Services | Dexta Synergy Services",
  description:
    "Design, Build, and Print services for Businesses, Schools, and Churches. We deliver world class value for your digital needs.",
};

export default function ServicesPage() {
  return (
    <>
      <PageTransition>
        <main>
          <ServicesHero />
          <ServicesGrid />
          <AudienceSection />
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
