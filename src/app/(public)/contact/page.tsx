import { Footer } from "@/components/home/footer";
import { ContactHero, ContactInfo } from "@/components/contact";
import { PageTransition } from "@/components/layout/page-transition";

export const metadata = {
  title: "Contact Us | Dexta Synergy Services",
  description:
    "Get in touch with Dexta Synergy Services. Located at 96 Elioparanwo Road, Port Harcourt, Rivers State, Nigeria.",
};

export default function ContactPage() {
  return (
    <>
      <PageTransition>
        <main>
          <ContactHero />
          <ContactInfo />
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
