"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  {
    href: "/admin/we-brand-schools/content",
    label: "Content",
  },
  {
    href: "/admin/we-brand-schools/testimonials",
    label: "Testimonials",
  },
  {
    href: "/admin/we-brand-schools/templates",
    label: "Templates",
  },
  {
    href: "/admin/we-brand-schools/portal",
    label: "Portal",
  },
  {
    href: "/admin/we-brand-schools/applications",
    label: "Applications",
  },
  {
    href: "/admin/we-brand-schools/referrals",
    label: "Referrals",
  },
  {
    href: "/admin/we-brand-schools/projects",
    label: "Projects",
  },
] as const;

export function WeBrandSchoolsAdminTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-[#222] bg-[#111] p-2">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "rounded-xl border border-transparent px-4 py-2 text-sm font-medium text-[#777] transition-colors hover:text-white",
            pathname === tab.href
              ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
              : "hover:bg-[#1a1a1a]",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
