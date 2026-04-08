import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: {
    default: "Admin | Dexta Synergy Services",
    template: "%s | Admin",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {children}
      <Toaster theme="dark" />
    </div>
  );
}
