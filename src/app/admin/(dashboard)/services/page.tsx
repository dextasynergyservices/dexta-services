import { AdminHeader } from "@/components/admin/header";
import {
  getProjectSectionBackgroundImage,
  getServicesContent,
} from "./actions";
import { ServicesForm } from "./_components/services-form";

export const metadata = {
  title: "Project Section — Admin",
};

export default async function ServicesPage() {
  const [services, sectionBackgroundImagePublicId] = await Promise.all([
    getServicesContent(),
    getProjectSectionBackgroundImage(),
  ]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Project Section"
        description="Edit the shared section background image plus the title, description, icon, and accent color for each homepage project card"
      />
      <ServicesForm
        services={services}
        sectionBackgroundImagePublicId={sectionBackgroundImagePublicId}
      />
    </div>
  );
}
