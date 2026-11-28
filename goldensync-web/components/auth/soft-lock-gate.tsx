"use client";

/**
 * WHAT: Global soft-lock watcher — keeps soft-logged-out users off app pages.
 * HOW: If cookie set and path is an app route → /sign-in; if grace expired + still signed in → Clerk signOut.
 * SCREEN: Invisible; may redirect to /sign-in or end the Clerk session after 10 minutes.
 * EDIT: Grace length is limits.SOFT_LOCK_GRACE_MINUTES.
 * KEEP: Must stay mounted under ClerkProvider. RISK: High — auth.
 */

import { useAuth, useClerk } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import {
  SOFT_LOCK_CHANGE_EVENT,
  clearSoftLock,
  isSoftLockedAppPath,
  isWithinSoftLockGrace,
  readSoftLockAtClient,
  softLockGraceMs,
  softLockNeedsHardLogout,
} from "@/lib/auth/soft-lock";
import { limits } from "@/lib/config/limits";

export function SoftLockGate() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const graceMs = softLockGraceMs(limits.SOFT_LOCK_GRACE_MINUTES);
  /** Observable lock timestamp so arming after logout re-schedules the grace timer. */
  const [lockedAt, setLockedAt] = React.useState<number | null>(null);

  React.useEffect(() => {
    const sync = () => setLockedAt(readSoftLockAtClient());
    sync();
    window.addEventListener(SOFT_LOCK_CHANGE_EVENT, sync);
    const id = window.setInterval(sync, 2000);
    return () => {
      window.removeEventListener(SOFT_LOCK_CHANGE_EVENT, sync);
      window.clearInterval(id);
    };
  }, []);

  React.useEffect(() => {
    if (!isLoaded) return;
    if (lockedAt == null) return;

    // WHAT: Grace over — force real Clerk sign-out so next login needs password + email OTP.
    if (softLockNeedsHardLogout(lockedAt, Date.now(), graceMs) && isSignedIn) {
      void signOut({ redirectUrl: "/sign-in" })
        .then(() => {
          clearSoftLock();
        })
        .catch(() => {
          /* KEEP lock if sign-out fails so withApi still blocks. */
        });
      return;
    }

    // WHAT: Still within grace — bounce app pages back to the locked sign-in screen.
    if (
      isWithinSoftLockGrace(lockedAt, Date.now(), graceMs) &&
      isSoftLockedAppPath(pathname)
    ) {
      router.replace("/sign-in");
    }
  }, [graceMs, isLoaded, isSignedIn, lockedAt, pathname, router, signOut]);

  // WHAT: Timer fires at grace end even if the user stays on /sign-in.
  React.useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (lockedAt == null || !isWithinSoftLockGrace(lockedAt, Date.now(), graceMs))
      return;

    const remaining = graceMs - (Date.now() - lockedAt);
    if (remaining <= 0) return;

    const armedAt = lockedAt;
    const id = window.setTimeout(() => {
      // Skip if Continue cleared the lock or a newer lock replaced it.
      if (readSoftLockAtClient() !== armedAt) return;
      void signOut({ redirectUrl: "/sign-in" })
        .then(() => {
          clearSoftLock();
        })
        .catch(() => {
          /* KEEP lock if sign-out fails. */
        });
    }, remaining);

    return () => window.clearTimeout(id);
  }, [graceMs, isLoaded, isSignedIn, lockedAt, signOut]);

  return null;
}
