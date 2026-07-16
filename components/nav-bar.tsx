"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "My Shelf", icon: BookOpen },
  { href: "/recommendations", label: "Discover", icon: Sparkles },
];

export function NavBar() {
  const pathname = usePathname();
  return (
    <header className="border-b border-[hsl(var(--forest)/0.2)] bg-[hsl(var(--parchment))]/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display italic text-2xl font-semibold text-[hsl(var(--forest))]">
            Shelfie
          </span>
          <span className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-[hsl(var(--burgundy))] font-body mt-1">
            a personal library
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  active
                    ? "bg-[hsl(var(--forest))] text-[hsl(var(--parchment))]"
                    : "text-[hsl(var(--forest))] hover:bg-[hsl(var(--forest)/0.1)]"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="shelf-divider" />
    </header>
  );
}
