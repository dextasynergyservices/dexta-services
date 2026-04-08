import { AdminHeader } from "@/components/admin/header";
import { OffersContentForm } from "./_components/offers-content-form";
import { getOffersPageContent } from "./actions";

export const metadata = {
  title: "Offers Content — Admin",
};

export const dynamic = "force-dynamic";

export default async function OffersContentPage() {
  const content = await getOffersPageContent();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Offers Page Content"
        description="Edit the live hero copy, audience intro, offer card labels, and bottom CTA for the /offers page"
      />
      <OffersContentForm content={content} />
    </div>
  );
}
