import { Footer } from "@/components/home/footer";
import { AudienceHero } from "@/components/offers";
import { businessPlans, schoolsPlans, churchesPlans } from "@/components/offers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

export const metadata = {
  title: "Our Offers | Dexta Synergy Services",
  description:
    "Explore Dexta Synergy REACH and SETUP offers for Businesses, Schools, and Churches.",
};

export default function OffersPage() {
  const audiences = [businessPlans, schoolsPlans, churchesPlans];

  return (
    <>
      <PageTransition>
        <main className="bg-white relative overflow-hidden">
          {/* Subtle animated background accents for this page */}
          <div className="pointer-events-none absolute -top-40 -right-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <AudienceHero
            config={{
              ...businessPlans,
              title: "Dexta REACH & SETUP Offers",
              subtitle:
                "Choose the offer tailored to your audience: Businesses, Schools, or Churches & Organizations.",
            }}
          />

          <section className="bg-white py-16 sm:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#212529]">
                  Choose Your Audience
                </h2>
                <p className="mt-4 text-base sm:text-lg text-gray-600">
                  Each offer bundle is tuned to the needs of a specific group while
                  keeping Dexta&apos;s Digital Synergy DNA.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {audiences.map((audience) => (
                  <ScrollReveal key={audience.id} delay={0.1}>
                    <Link
                      href={`/offers/${audience.id}`}
                      className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between transform hover:-translate-y-1"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-500 mb-2">
                          {audience.id}
                        </p>
                        <h3 className="text-xl font-bold text-[#212529] mb-2">
                          {audience.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {audience.subtitle}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm font-semibold text-cyan-600 group-hover:text-cyan-700">
                        <span>View REACH &amp; SETUP offers</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </main>
      </PageTransition>
      <Footer />
    </>
  );
}


