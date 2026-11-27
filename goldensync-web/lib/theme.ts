// WHAT: Light/dark theme — toggles class on <html> and saves choice in localStorage (key gs-theme).
// SCREEN: User sees colors change app-wide. EDIT: getStoredTheme default (currently dark). RISK: Low.

/**
 * Theme — light | dark on <html class="dark">, persisted in localStorage.
 */

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "gs-theme";

/** Read stored theme; default dark (product baseline). */
// WHAT: Read saved theme from browser; returns dark on server or if missing.
export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/** Apply theme to documentElement and persist. */
// WHAT: Sets dark class and writes localStorage — call after user picks theme.
export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore quota */
  }
}

/** Toggle between light and dark; returns the new mode. */
// WHAT: Flip light↔dark for theme button in UI.
export function toggleTheme(): ThemeMode {
  const next: ThemeMode = getStoredTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
