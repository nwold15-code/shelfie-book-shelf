"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
}

export function StarRating({ value, onChange, size = "sm" }: StarRatingProps) {
  const dims = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n === value ? 0 : n)}
          className={cn(
            "transition-transform",
            onChange && "hover:scale-110 cursor-pointer"
          )}
          aria-label={`Rate ${n} star`}
        >
          <Star
            className={cn(
              dims,
              n <= value
                ? "fill-[hsl(var(--gold))] text-[hsl(var(--gold))]"
                : "text-[hsl(var(--forest)/0.3)]"
            )}
          />
        </button>
      ))}
    </div>
  );
}
