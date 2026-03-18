"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Mail,
  LogOut,
  Menu,
  X,
  User,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface AdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/registrations", label: "Registrations", icon: Users },
  { href: "/admin/messaging", label: "Messaging", icon: Mail },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: globalThis.MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as globalThis.Node)
      ) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center py-4 gap-2 px-2">
        <Image
          src="/images/dexta1.png"
          alt="Dexta Logo"
          width={80}
          height={40}
          priority
          className="h-auto w-[80px]"
        />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-cyan-500/10 text-cyan-400"
                : "text-[#888] hover:bg-[#1a1a1a] hover:text-white",
            )}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-[#222] p-4">
        <div className="mb-3">
          <p className="truncate text-sm font-medium text-white">
            {user?.name ?? "Admin"}
          </p>
          <p className="truncate text-xs text-[#999]">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full justify-start gap-2 text-[#888] hover:bg-red-950/30 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top navbar */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between bg-black/80 px-4 backdrop-blur-md lg:hidden">
        {/* Left: menu + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-white hover:bg-white/10"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin">
            <Image
              src="/images/dexta1.png"
              alt="Dexta Logo"
              width={70}
              height={32}
              priority
              className="h-7 w-auto"
            />
          </Link>
        </div>

        {/* Right: profile icon */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#222] text-white hover:bg-[#333] transition-colors"
            aria-label="Profile menu"
          >
            <User className="h-4 w-4" />
          </button>

          {/* Profile dropdown */}
          <div
            className={cn(
              "absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#222] bg-[#111] p-2 shadow-2xl transition-all duration-200",
              profileOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-2 pointer-events-none",
            )}
          >
            <div className="border-b border-[#222] px-3 py-2.5 mb-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name ?? "Admin"}
              </p>
              <p className="truncate text-xs text-[#666]">{user?.email}</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#888] hover:bg-[#1a1a1a] hover:text-white transition-colors"
              onClick={() => setProfileOpen(false)}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Go to website
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#888] hover:bg-red-950/30 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay — always mounted, animated with transitions */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden transition-opacity duration-300",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "relative h-full w-64 bg-[#111] shadow-2xl transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-4 z-10 rounded-lg p-1 text-[#888] hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
          {sidebar}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 border-r border-[#222] bg-[#111] lg:block">
        {sidebar}
      </div>
    </>
  );
}
