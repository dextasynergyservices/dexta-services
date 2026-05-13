import { PageTransition } from "@/components/layout/page-transition";
import { AboutPageView } from "@/components/about/about-page";
import {
  fetchAboutExpertiseItems,
  fetchAboutMilestones,
  fetchAboutPageContent,
  fetchAboutSpaceItems,
  fetchAboutTeamMembers,
  fetchAboutValueItems,
} from "@/lib/api";

export const metadata = {
  title: "About Us | Dexta Synergy Services",
  description:
    "We are DEXTA - A super business, saturating our world with imprints of value. Learn about our team and mission.",
};

export default async function AboutPage() {
  const [
    content,
    milestones,
    expertiseItems,
    teamMembers,
    spaceItems,
    valueItems,
  ] = await Promise.all([
    fetchAboutPageContent(),
    fetchAboutMilestones(),
    fetchAboutExpertiseItems(),
    fetchAboutTeamMembers(),
    fetchAboutSpaceItems(),
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
          spaceItems={spaceItems}
          valueItems={valueItems}
        />
      </PageTransition>
    </>
  );
}
