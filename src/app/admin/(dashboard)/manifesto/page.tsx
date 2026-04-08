import { AdminHeader } from "@/components/admin/header";
import { getManifestoContent } from "./actions";
import { ManifestoForm } from "./_components/manifesto-form";

export const metadata = {
  title: "Manifesto — Admin",
};

export default async function ManifestoPage() {
  const text = await getManifestoContent();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Manifesto"
        description="Edit the scroll-reveal brand statement on the homepage"
      />
      <ManifestoForm text={text} />
    </div>
  );
}
