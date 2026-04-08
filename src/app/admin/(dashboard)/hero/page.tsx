import { AdminHeader } from "@/components/admin/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getHeroAdminData } from "./actions";
import { HeroCopyForm } from "./_components/hero-copy-form";
import { HeroCardsManager } from "./_components/hero-cards-manager";

export const metadata = {
  title: "Hero Section — Admin",
};

export default async function HeroPage() {
  const { content, cards } = await getHeroAdminData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Hero Section"
        description="Manage the homepage hero content and service cards"
      />

      <Tabs defaultValue="copy">
        <TabsList className="h-9 rounded-lg border border-[#222] bg-[#0d0d0d] p-1">
          <TabsTrigger
            value="copy"
            className="rounded-md px-4 text-xs font-medium text-[#666] transition-colors data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white data-[state=inactive]:hover:text-[#aaa]"
          >
            Hero Copy
          </TabsTrigger>
          <TabsTrigger
            value="cards"
            className="rounded-md px-4 text-xs font-medium text-[#666] transition-colors data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white data-[state=inactive]:hover:text-[#aaa]"
          >
            Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="copy" className="mt-6">
          <HeroCopyForm content={content} />
        </TabsContent>

        <TabsContent value="cards" className="mt-6">
          <HeroCardsManager cards={cards} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
