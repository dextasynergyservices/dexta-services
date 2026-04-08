import { PageTransition } from "@/components/layout/page-transition";
import { AboutPageView } from "@/components/about/about-page";
import {
  fetchAboutExpertiseItems,
  fetchAboutMilestones,
  fetchAboutPageContent,
  fetchAboutTeamMembers,
  fetchAboutValueItems,
} from "@/lib/api";

export const metadata = {
  title: "About Us | Dexta Synergy Services",
  description:
    "We are DEXTA - A super business, saturating our world with imprints of value. Learn about our team and mission.",
};

export default async function AboutPage() {
  const [content, milestones, expertiseItems, teamMembers, valueItems] =
    await Promise.all([
      fetchAboutPageContent(),
      fetchAboutMilestones(),
      fetchAboutExpertiseItems(),
      fetchAboutTeamMembers(),
      fetchAboutValueItems(),
    ]);

  return (
    <>
      <PageTransition>
        <AboutPageView
          content={content}
          milestones={milestones}
          expertiseItems={expertiseItems}
          teamMembers={teamMembers}
          valueItems={valueItems}
        />
      </PageTransition>
    </>
  );
}
