import { AdminHeader } from "@/components/admin/header";
import { AboutCtaContentForm } from "../_components/about-section-content-forms";
import { getAboutAdminData } from "../actions";

export const metadata = {
  title: "About CTA — Admin",
};

export const dynamic = "force-dynamic";

export default async function AboutCtaAdminPage() {
  const data = await getAboutAdminData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="About Bottom CTA"
        description="Edit the closing call-to-action section at the bottom of the public About page."
      />
      <AboutCtaContentForm content={data.content} />
    </div>
  );
}
