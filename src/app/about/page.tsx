import { Footer } from "@/components/home/footer";
import { PageTransition } from "@/components/layout/page-transition";
import {
  AboutHero, 
  StorySection, 
  ExpertiseSection, 
  TeamSection, 
  ValuesSection 
} from "@/components/about";

export const metadata = {
  title: "About Us | Dexta Synergy Services",
  description: "We are DEXTA - A super business, saturating our world with imprints of value. Learn about our team and mission.",
};

export default function AboutPage() {
  return (
    <>
      <PageTransition>
        <main>
          <AboutHero />
          <StorySection />
          <ExpertiseSection />
          <TeamSection />
          <ValuesSection />
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
