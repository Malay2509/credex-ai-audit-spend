"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { BarChart3, Zap } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/audit", label: "Audit" },
  { href: "/results", label: "Results" },
];

/**
 * Top navigation bar — sticky, glass-morphic, inspired by Linear's nav.
 */
export function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-white/8 bg-[#0a0a0f]/80 backdrop-blur-xl"
      role="banner"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="AI Spend Audit — Home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
            <Zap className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-semibold text-white text-sm">
            AI Spend Audit
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                pathname === link.href
                  ? "text-white bg-white/8"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/results" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
              View Results
            </Button>
          </Link>
          <Link href="/audit">
            <Button size="sm">Start Audit</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
