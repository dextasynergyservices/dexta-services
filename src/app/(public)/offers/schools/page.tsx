import { Footer } from "@/components/home/footer";
import {
  AudienceHero,
  PricingSection,
  SetupPricingSection,
  schoolsPlans,
} from "@/components/offers";
import { PageTransition } from "@/components/layout/page-transition";

export const metadata = {
  title: "For Schools | Dexta Synergy Services",
  description:
    "Educational digital transformation packages. REACH and SET UP offers for schools and educational institutions.",
};

export default function SchoolsOffersPage() {
  return (
    <>
      <PageTransition>
        <main>
          <AudienceHero config={schoolsPlans} />
          <PricingSection
            title="REACH OFFERS"
            plans={schoolsPlans.reachPlans}
            color={schoolsPlans.color}
          />
          <SetupPricingSection
            plans={schoolsPlans.setupPlans}
            color={schoolsPlans.color}
          />
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
