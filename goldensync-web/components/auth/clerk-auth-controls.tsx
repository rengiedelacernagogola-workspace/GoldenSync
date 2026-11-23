"use client";

/**
 * Clerk auth controls — visible signed-in / signed-out chrome (clerk-setup Step 3).
 * Wrapped in Suspense by callers when used from Server Components.
 */

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/core/button";

/** Compact header controls for Account / shell. */
export function ClerkAuthControls() {
  return (
    <div
      data-slot="gs-clerk-auth-controls"
      className="flex items-center gap-space-3"
    >
      <Show when="signed-out">
        <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
          <Button variant="Secondary" size="sm">
            Sign in
          </Button>
        </SignInButton>
        <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
          <Button variant="Primary" size="sm">
            Sign up
          </Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </Show>
    </div>
  );
}
