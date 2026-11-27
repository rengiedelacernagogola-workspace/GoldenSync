"use client"; // WHAT: Clerk buttons need browser session. RISK: High

/**
 * Clerk auth controls — visible signed-in / signed-out chrome (clerk-setup Step 3).
 * Wrapped in Suspense by callers when used from Server Components.
 */

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/core/button";

/** Compact header controls for Account / shell. */
// WHAT: Small Sign in / Sign up / avatar cluster. HOW: Show swaps UI by login state. EDIT: redirect URLs on buttons. RISK: High
export function ClerkAuthControls() {
  return (
    <div
      data-slot="gs-clerk-auth-controls"
      className="flex items-center gap-space-3"
    >
      {/* SCREEN: Buttons when visitor is not logged in. */}
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
      {/* SCREEN: Profile menu (avatar) when logged in. */}
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
