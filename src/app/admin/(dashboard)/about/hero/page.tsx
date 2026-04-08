import { AdminHeader } from "@/components/admin/header";
import { AboutContentForm } from "../_components/about-content-form";
import { getAboutAdminData } from "../actions";

export const metadata = {
  title: "About Hero — Admin",
};

export const dynamic = "force-dynamic";

export default async function AboutHeroAdminPage() {
  const data = await getAboutAdminData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="About Hero"
        description="Edit only the hero section of the public About page."
      />
      <AboutContentForm content={data.content} />
    </div>
  );
}
