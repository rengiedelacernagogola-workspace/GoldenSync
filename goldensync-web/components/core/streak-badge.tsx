"use client";

/**
 * StreakBadge — flame + day count beside TopBar notifications.
 * RULE: avoid SSR→client flicker (0 days → N days) by waiting for mount.
 */

import { Flame } from "lucide-react";
import * as React from "react";

import {
  getStreakDays,
  streakLabel,
  touchStreak,
} from "@/lib/streak";
import { cn } from "@/lib/utils";

export interface StreakBadgeProps {
  className?: string;
}

/** Same control height as notification IconOnly sm; small lettering for days. */
export function StreakBadge({ className }: StreakBadgeProps) {
  const [days, setDays] = React.useState<number | null>(null);

  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      setDays(touchStreak());
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "gs-study-streak") setDays(getStreakDays());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const label = days == null ? "…" : streakLabel(days);

  return (
    <div
      data-slot="gs-streak-badge"
      title={days == null ? "Study streak" : `${streakLabel(days)} streak`}
      aria-label={
        days == null
          ? "Study streak"
          : `Study streak, ${streakLabel(days)} ongoing`
      }
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-md px-space-2",
        "text-text-muted",
        className,
      )}
    >
      <Flame className="size-4 shrink-0 text-status-warning" aria-hidden />
      <span className="min-w-[2.75rem] text-[10px] font-medium leading-none tracking-tight text-text-secondary whitespace-nowrap tabular-nums">
        {label}
      </span>
    </div>
  );
}
