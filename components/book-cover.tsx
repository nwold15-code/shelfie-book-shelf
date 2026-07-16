"use client";

import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookCoverProps {
  coverUrl: string | null;
  title: string;
  className?: string;
}

export function BookCover({ coverUrl, title, className }: BookCoverProps) {
  if (coverUrl) {
    // Using a plain <img> here since covers come from an external,
    // unconfigured host (Open Library) and are decorative thumbnails.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={coverUrl}
        alt={title}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-[hsl(var(--forest)/0.12)] text-[hsl(var(--forest)/0.5)] p-2 text-center",
        className
      )}
    >
      <BookOpen className="h-6 w-6" />
    </div>
  );
}
