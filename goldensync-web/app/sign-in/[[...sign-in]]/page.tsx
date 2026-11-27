// WHAT: Clerk sign-in UI and React Suspense (loading wrapper). RISK: High — authentication.
import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

import { AuthMarketingPanel } from "@/components/features/auth/auth-marketing-panel";

/**
 * Clerk Sign In — full-viewport adaptive split (CDEC-016).
 * Suspense required with cacheComponents.
 */

// WHAT: Route /sign-in page. SCREEN: Marketing left (large screens) + Clerk form right. RISK: High
export default function SignInPage() {
  return (
    <div className="bg-ambient grid min-h-dvh w-full min-w-0 grid-cols-1 overflow-x-hidden bg-bg-base lg:grid-cols-2">
      {/* SCREEN: Brand story and feature bullets. */}
      <div className="flex min-h-0 w-full min-w-0 border-b border-border-subtle lg:min-h-dvh lg:border-b-0">
        <AuthMarketingPanel />
      </div>

      {/* WHAT: Clerk-hosted email/social sign-in. HOW: appearance vars match GoldenSync tokens. */}
      <div className="flex w-full min-w-0 items-center justify-center px-space-4 py-space-8 sm:px-space-8 lg:min-h-dvh lg:overflow-y-auto">
        <Suspense
          fallback={
            <p className="text-body-sm text-text-muted">Loading sign in…</p>
          }
        >
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "var(--accent-primary)",
                colorBackground: "var(--bg-muted)",
                colorForeground: "var(--text-primary)",
                colorMutedForeground: "var(--text-muted)",
                colorNeutral: "var(--border-default)",
                colorInput: "var(--bg-base)",
                colorInputForeground: "var(--text-primary)",
                borderRadius: "0.5rem",
              },
              elements: {
                rootBox: "mx-auto w-full max-w-md",
                card: "w-full border border-border-strong bg-bg-muted shadow-hover",
                socialButtonsBlockButton:
                  "border border-border-default bg-bg-base text-text-primary hover:bg-bg-subtle",
                socialButtonsBlockButtonText:
                  "text-text-primary font-medium",
                socialButtonsProviderIcon: "brightness-100",
              },
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
