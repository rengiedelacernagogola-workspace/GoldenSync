import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

/**
 * Clerk Sign Up — default registration entry (CDEC-016).
 * Suspense required with cacheComponents.
 */

export default function SignUpPage() {
  return (
    <div className="bg-ambient flex min-h-screen items-center justify-center bg-bg-base px-space-4">
      <Suspense
        fallback={
          <p className="text-body-sm text-text-muted">Loading sign up…</p>
        }
      >
        <SignUp
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
