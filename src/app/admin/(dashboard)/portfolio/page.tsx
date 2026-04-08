import { AdminHeader } from "@/components/admin/header";
import { getPortfolioItems, getPortfolioFeaturedCounts } from "./actions";
import { PortfolioManager } from "./_components/portfolio-manager";
import type { ServiceType } from "./actions";

export const metadata = {
  title: "Portfolio — Admin",
};

const VALID_TABS: ServiceType[] = ["DESIGN", "BUILD", "PRINT"];

interface PortfolioPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function PortfolioPage({
  searchParams,
}: PortfolioPageProps) {
  const { tab } = await searchParams;
  const activeTab: ServiceType =
    VALID_TABS.find((t) => t === tab?.toUpperCase()) ?? "DESIGN";

  const [items, featuredCounts] = await Promise.all([
    getPortfolioItems(),
    getPortfolioFeaturedCounts(),
  ]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Portfolio"
        description="Upload and manage images and videos for each service tab — mark items as featured to show them on the homepage service cards"
      />
      <PortfolioManager
        items={items}
        featuredCounts={featuredCounts}
        activeTab={activeTab}
      />
    </div>
  );
}
