import { AdminHeader } from "@/components/admin/header";
import { ContactManager, type ContactSectionKey } from "./_components/contact-manager";
import { getContactAdminData } from "./actions";

export const metadata = {
  title: "Contact Page — Admin",
};

export const dynamic = "force-dynamic";

function normalizeSection(
  value: string | string[] | undefined,
): ContactSectionKey {
  const candidate = Array.isArray(value) ? value[0] : value;

  switch (candidate) {
    case "socials":
    case "messages":
      return candidate;
    default:
      return "content";
  }
}

function normalizePage(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(candidate ?? "1", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

interface ContactAdminPageProps {
  searchParams: Promise<{ section?: string | string[]; page?: string | string[] }>;
}

export default async function ContactAdminPage({
  searchParams,
}: ContactAdminPageProps) {
  const params = await searchParams;
  const initialSection = normalizeSection(params.section);
  const page = normalizePage(params.page);
  const data = await getContactAdminData(page);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Contact Page"
        description="Manage one shared contact system for the home page, contact page, footer socials, and the admin inbox for contact form submissions."
      />
      <ContactManager data={data} initialSection={initialSection} />
    </div>
  );
}
