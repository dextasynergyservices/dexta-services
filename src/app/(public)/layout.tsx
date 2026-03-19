import { Navbar } from "@/components/layout/navbar";
import { EnhancedCursor } from "@/components/shared/enhanced-cursor";
import { Footer } from "@/components/home/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EnhancedCursor />
      <Navbar />
      <div className="h-16 sm:h-20" />
      {children}
      <Footer />
    </>
  );
}
