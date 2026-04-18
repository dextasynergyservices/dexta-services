import { AdminHeader } from "@/components/admin/header";
import { getSchoolWebsiteTestimonialsAdmin } from "../actions";
import { WeBrandSchoolsAdminTabs } from "../_components/we-brand-schools-admin-tabs";
import { TestimonialsManager } from "./testimonials-manager";

export const metadata = {
  title: "We Brand Schools Testimonials — Admin",
};

export const dynamic = "force-dynamic";

export default async function WeBrandSchoolsTestimonialsPage() {
  const testimonials = await getSchoolWebsiteTestimonialsAdmin();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="We Brand Schools Testimonials"
        description="Manage the school logos, write-ups, and contact details shown in the moving testimonial section on the public page."
      />
      <WeBrandSchoolsAdminTabs />
      <TestimonialsManager testimonials={testimonials} />
    </div>
  );
}
