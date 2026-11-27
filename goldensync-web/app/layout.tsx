// WHAT: Pull in sign-in (Clerk), fonts, types, and global styles for every page. RISK: High — login wiring; ask a developer before changing Clerk. KEEP: import paths.
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { ProtoFab } from "@/components/dev/proto-fab";

import "./globals.css";

/**
 * WHAT: Outer wrapper for every page — fonts, login provider, light/dark boot, and a tiny Proto button.
 * HOW: Loads Inter + Roboto Mono, runs a tiny script so theme matches saved choice before paint, wraps children in ClerkProvider (login), then ProtoFab.
 * SCREEN: Invisible frame around the app; ProtoFab may show a small floating control on /dev only.
 * EDIT: `metadata.title` / description for browser tab text. Fonts via Inter / Roboto_Mono options.
 * KEEP: ClerkProvider, theme boot script, and `suppressHydrationWarning` on <html> — needed for login + theme.
 * RISK: High — breaking ClerkProvider or the theme script can break sign-in or flash the wrong theme.
 */

// WHAT: Main UI font (Inter). HOW: next/font loads it and sets CSS var --font-sans on <html>. EDIT: Swap font here for a new look. RISK: Low
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

// WHAT: Monospace font for codes/numbers. HOW: Sets --font-mono. EDIT: Change only if design asks. RISK: Low
const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

// WHAT: Browser tab title and short description (SEO / bookmarks). EDIT: title and description strings. RISK: Low
export const metadata: Metadata = {
  title: "GoldenSync",
  description: "Personal semester, subject, and grade tracker",
};

// WHAT: Mobile screen scaling rules. HOW: Tells phones to use device width and allow notch-safe layout. KEEP: Usually leave as-is. RISK: Medium
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// WHAT: Tiny script that runs before paint to pick light vs dark theme. HOW: Reads gs-theme from localStorage and adds/removes class "dark" on <html>. RISK: Medium — wrong script causes flash or wrong theme.
const themeBootScript = `(function(){try{var t=localStorage.getItem("gs-theme");var d=document.documentElement;if(t==="light")d.classList.remove("dark");else d.classList.add("dark");}catch(e){document.documentElement.classList.add("dark");}})();`;

// WHAT: RootLayout wraps every page in the app (Next.js "root layout"). SCREEN: Outer HTML shell only; page content goes in {children}. RISK: High — structure affects whole app.
export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${robotoMono.variable} dark h-full antialiased`}
    >
      <head>
        {/* WHAT: Runs themeBootScript early so colors match user preference. KEEP: Must stay in <head>. RISK: Medium */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      {/* SCREEN: Full-page background and column layout. EDIT: bg-ambient / spacing classes change look. RISK: Low */}
      <body className="bg-ambient flex min-h-dvh w-full min-w-0 flex-col overflow-x-hidden">
        {/* WHAT: ClerkProvider gives sign-in state to all child pages. HOW: appearance.theme matches shadcn UI. RISK: High — auth. */}
        <ClerkProvider appearance={{ theme: shadcn }}>
          {children}
          {/* WHAT: Developer-only floating button (prototype tools). SCREEN: Small FAB when enabled. */}
          <ProtoFab />
        </ClerkProvider>
      </body>
    </html>
  );
}
