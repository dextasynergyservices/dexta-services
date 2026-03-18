import { Navbar } from "@/components/layout/navbar";
import { EnhancedCursor } from "@/components/shared/enhanced-cursor";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EnhancedCursor />
      <Navbar />
      {children}
    </>
  );
}
