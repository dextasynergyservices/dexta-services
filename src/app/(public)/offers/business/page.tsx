import { Footer } from "@/components/home/footer";
import {
  AudienceHero,
  PricingSection,
  SetupPricingSection,
  businessPlans,
} from "@/components/offers";
import { PageTransition } from "@/components/layout/page-transition";

export const metadata = {
  title: "For Businesses | Dexta Synergy Services",
  description:
    "Digital solutions tailored for your business growth. REACH and SET UP offers with competitive pricing.",
};

export default function BusinessOffersPage() {
  return (
    <>
      <PageTransition>
        <main>
          <AudienceHero config={businessPlans} />
          <PricingSection
            title="REACH OFFERS"
            plans={businessPlans.reachPlans}
            color={businessPlans.color}
          />
          <SetupPricingSection
            plans={businessPlans.setupPlans}
            color={businessPlans.color}
          />
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
