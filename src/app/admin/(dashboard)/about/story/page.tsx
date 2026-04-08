import { AdminHeader } from "@/components/admin/header";
import { AboutStoryContentForm } from "../_components/about-section-content-forms";
import { StoryTimelineManager } from "../_components/story-timeline-manager";
import { getAboutAdminData } from "../actions";

export const metadata = {
  title: "About Story — Admin",
};

export const dynamic = "force-dynamic";

export default async function AboutStoryAdminPage() {
  const data = await getAboutAdminData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="About Story"
        description="Edit the story copy and timeline cards shown in the About page story section."
      />
      <AboutStoryContentForm content={data.content} />
      <StoryTimelineManager items={data.milestones} />
    </div>
  );
}
