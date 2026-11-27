// WHAT: Clerk registration component — hosts the hosted SignUp UI.
// SCREEN: Full-screen centered card on ambient background at /sign-up.
// HOW: appearance.variables map GoldenSync CSS tokens onto Clerk theme.
// RISK: High — creates new accounts; keep Clerk dashboard settings in sync.
import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

/**
 * Clerk Sign Up — default registration entry (CDEC-016).
 * Suspense required with cacheComponents.
 */

// WHAT: Route /sign-up page. SCREEN: Centered registration card on ambient background. RISK: High
export default function SignUpPage() {
  return (
    <div className="bg-ambient flex min-h-screen items-center justify-center bg-bg-base px-space-4">
      {/* HOW: Suspense shows fallback text until Clerk client bundle is ready. */}
      <Suspense
        fallback={
          <p className="text-body-sm text-text-muted">Loading sign up…</p>
        }
      >
        <SignUp
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
              rootBox: "mx-auto",
              card: "bg-bg-muted border border-border-strong shadow-hover",
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
  );
}
