import { Navbar } from "@/components/layout/navbar";
import { EnhancedCursor } from "@/components/shared/enhanced-cursor";
import { Footer } from "@/components/home/footer";
import { fetchContactPageContent, fetchContactSocialLinks } from "@/lib/api";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [contactContent, contactSocialLinks] = await Promise.all([
    fetchContactPageContent(),
    fetchContactSocialLinks(),
  ]);

  return (
    <>
      <EnhancedCursor />
      <Navbar />
      <div className="h-16 sm:h-20" />
      {children}
      <Footer contact={contactContent} socialLinks={contactSocialLinks} />
    </>
  );
}
