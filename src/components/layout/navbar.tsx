"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  href: string;
  label: string;
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Determine if we're on the home page
  const isHomePage = pathname === "/";

  // Navigation items - use hash for home page, regular paths for other pages
  const navItems: NavItem[] = isHomePage
    ? [
        { href: "#home", label: "Home" },
        { href: "#projects", label: "Projects" },
        { href: "#services", label: "Services" },
        { href: "#contact", label: "Contact" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/projects", label: "Projects" },
        { href: "/services", label: "Services" },
        { href: "/contact", label: "Contact" },
      ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle navigation
  const handleNavClick = (href: string) => {
    setIsOpen(false);

    if (isHomePage && href.startsWith("#")) {
      // Scroll to section on home page
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          const offsetTop =
            element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: offsetTop - 80,
            behavior: "smooth",
          });
        }
      }, 100);
    } else if (!href.startsWith("#")) {
      // Navigate to other pages
      router.push(href);
    }
  };

  // Check if link is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-[100] w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
      }`}
      style={{ zIndex: 1000 }}
    >
      <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Dexta
          </span>
          <span className="hidden sm:inline text-xs text-blue-500/70 font-mono tracking-wider">
            STUDIO
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <button
                key={`desktop-${item.label}`}
                onClick={() => handleNavClick(item.href)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button
                className="h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isOpen ? (
                  <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] sm:w-[320px] border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-[1000]"
              style={{ zIndex: 1001 }}
            >
              <nav className="flex flex-col gap-2 py-6">
                {/* Logo in mobile menu */}
                <div className="flex items-center gap-2 px-4 py-2 mb-4">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Dexta
                  </span>
                  <span className="text-xs text-blue-500/70 font-mono">
                    STUDIO
                  </span>
                </div>

                <div className="my-2 border-t border-gray-200 dark:border-gray-800" />

                {/* Mobile Navigation Links */}
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <button
                      key={`mobile-${item.label}`}
                      onClick={() => handleNavClick(item.href)}
                      className={`px-4 py-3 text-base font-medium text-left transition-all duration-200 rounded-lg ${
                        active
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500"
                          : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
