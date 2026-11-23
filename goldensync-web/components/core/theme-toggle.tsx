"use client";

/**
 * ThemeToggle — IconOnly light/dark switcher for TopBar.
 */

import { Moon, Sun } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import {
  applyTheme,
  getStoredTheme,
  toggleTheme,
  type ThemeMode,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  className?: string;
}

/** Toggle html.dark; persists to localStorage. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const [mode, setMode] = React.useState<ThemeMode>("dark");

  React.useEffect(() => {
    const stored = getStoredTheme();
    applyTheme(stored);
    const handle = window.setTimeout(() => setMode(stored), 0);
    return () => window.clearTimeout(handle);
  }, []);

  return (
    <Button
      variant="IconOnly"
      size="md"
      aria-label={
        mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      title={mode === "dark" ? "Light mode" : "Dark mode"}
      className={cn(className)}
      onClick={() => setMode(toggleTheme())}
    >
      {mode === "dark" ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </Button>
  );
}
