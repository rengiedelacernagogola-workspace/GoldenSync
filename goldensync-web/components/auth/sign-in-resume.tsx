"use client";

/**
 * WHAT: Sign-in page soft-lock resume — Continue without password within 10 minutes.
 * HOW: Within grace + Clerk still signed in → clear cookie and go to dashboard; past grace → hard signOut then show SignIn.
 * SCREEN: Optional “Continue as signed-in user” card above the Clerk form.
 * EDIT: Grace from limits.SOFT_LOCK_GRACE_MINUTES; copy strings below.
 * KEEP: After hard logout, Clerk SignIn must require password + email OTP (Dashboard MFA).
 * RISK: High — auth.
 */

import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/core/button";
import {
  clearSoftLock,
  isWithinSoftLockGrace,
  readSoftLockAtClient,
  softLockGraceMs,
  softLockNeedsHardLogout,
} from "@/lib/auth/soft-lock";
import { limits } from "@/lib/config/limits";

export function SignInResume({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [ready, setReady] = React.useState(false);
  const [showContinue, setShowContinue] = React.useState(false);
  const graceMs = softLockGraceMs(limits.SOFT_LOCK_GRACE_MINUTES);

  React.useEffect(() => {
    if (!isLoaded) return;

    const lockedAt = readSoftLockAtClient();

    // WHAT: No soft lock — show normal SignIn (or leave alone if already signed in elsewhere).
    if (lockedAt == null) {
      setShowContinue(false);
      setReady(true);
      return;
    }

    // WHAT: Grace expired — end Clerk session so password + email OTP are required.
    if (softLockNeedsHardLogout(lockedAt, Date.now(), graceMs)) {
      clearSoftLock();
      if (isSignedIn) {
        void signOut({ redirectUrl: "/sign-in" }).finally(() => {
          setShowContinue(false);
          setReady(true);
        });
        return;
      }
      setShowContinue(false);
      setReady(true);
      return;
    }

    // WHAT: Still inside grace and session alive — offer password-free Continue.
    if (isWithinSoftLockGrace(lockedAt, Date.now(), graceMs) && isSignedIn) {
      setShowContinue(true);
      setReady(true);
      return;
    }

    setShowContinue(false);
    setReady(true);
  }, [graceMs, isLoaded, isSignedIn, signOut]);

  function handleContinue() {
    clearSoftLock();
    setShowContinue(false);
    router.replace("/dashboard");
  }

  if (!ready) {
    return (
      <p className="text-body-sm text-text-muted">Checking session…</p>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-space-6">
      {showContinue ? (
        <div
          data-slot="gs-soft-lock-resume"
          className="flex w-full flex-col gap-space-3 rounded-lg border border-border-strong bg-bg-muted p-space-5 shadow-hover"
        >
          <p className="text-heading-sm text-text-primary">Welcome back</p>
          <p className="text-body-sm text-text-secondary">
            You signed out less than {limits.SOFT_LOCK_GRACE_MINUTES} minutes
            ago
            {user?.primaryEmailAddress?.emailAddress
              ? ` (${user.primaryEmailAddress.emailAddress})`
              : ""}
            . Continue without entering your password.
          </p>
          <Button
            variant="Primary"
            size="md"
            className="w-full"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      ) : null}
      {/* WHAT: Clerk SignIn — used after hard logout (password + email OTP when MFA email is on). */}
      {!showContinue ? children : null}
    </div>
  );
}
