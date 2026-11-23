import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

/**
 * Clerk Sign In — default auth entry (CDEC-016).
 * Suspense required with cacheComponents.
 */

export default function SignInPage() {
  return (
    <div className="bg-ambient flex min-h-screen items-center justify-center bg-bg-base px-space-4">
      <Suspense
        fallback={
          <p className="text-body-sm text-text-muted">Loading sign in…</p>
        }
      >
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-bg-muted border border-border-strong shadow-hover",
            },
          }}
        />
      </Suspense>
    </div>
  );
}
