import { Footer } from "@/components/home/footer";
import {
  AudienceHero,
  PricingSection,
  SetupPricingSection,
  churchesPlans,
} from "@/components/offers";
import { PageTransition } from "@/components/layout/page-transition";

export const metadata = {
  title: "For Churches & Organizations | Dexta Synergy Services",
  description:
    "Ministry and organization digital solutions. REACH and SET UP offers for churches and non-profit organizations.",
};

export default function ChurchesOffersPage() {
  return (
    <>
      <PageTransition>
        <main>
          <AudienceHero config={churchesPlans} />
          <PricingSection
            title="REACH OFFERS"
            plans={churchesPlans.reachPlans}
            color={churchesPlans.color}
          />
          <SetupPricingSection
            plans={churchesPlans.setupPlans}
            color={churchesPlans.color}
          />
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}
