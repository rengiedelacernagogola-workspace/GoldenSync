"use client"; // WHAT: Modals and router navigation run on client. RISK: Medium

/**
 * SessionWarning + SessionExpired — P1 overlays (Figma `49:2315` / `49:173`, UI-062).
 * FLOW: sessionActive false → Expired; warning before expire (proto Demo Panel).
 * Soft-lock: Log out arms grace cookie; Log in again goes to /sign-in resume path.
 */

import { useRouter } from "next/navigation";
import * as React from "react";

import { Backdrop } from "@/components/core/backdrop";
import { Button } from "@/components/core/button";
import { Modal } from "@/components/core/modal";
import { performSoftLogout } from "@/lib/auth/soft-lock";
import { useProtoActions, useSessionActive } from "@/state";
import { cn } from "@/lib/utils";

// WHAT: Props to demo or control "session expiring" warning from outside. RISK: Medium
export interface SessionModalsProps {
  /** Force warning open (Demo Panel / prototype). */
  warningOpen?: boolean;
  onWarningChange?: (open: boolean) => void;
}

/**
 * Session overlays — Stay signed in keeps session; Log out → soft lock → /sign-in.
 */
// WHAT: Full-screen modals for session timeout warning or expired session. SCREEN: Dimmed backdrop + modal. HOW: useSessionActive from proto state; Log out uses soft lock. RISK: Medium — soft lock wired; idle timeout still proto-driven.
export function SessionModals({
  warningOpen = false,
  onWarningChange,
}: SessionModalsProps) {
  const router = useRouter();
  const sessionActive = useSessionActive();
  const { setSessionActive } = useProtoActions();
  const expired = !sessionActive;

  // HOW: Render nothing unless warning is forced or session marked inactive.
  if (!warningOpen && !expired) return null;

  return (
    <div data-slot="gs-session-modals" className="fixed inset-0 z-[60]">
      {/* WHAT: Dark layer behind modal; click may dismiss warning only. */}
      <Backdrop
        onDismiss={() => {
          if (warningOpen) {
            setSessionActive(true);
            onWarningChange?.(false);
          }
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-space-6">
        <div className="pointer-events-auto w-full max-w-md">
          {warningOpen && sessionActive ? (
            <Modal
              title="Session expiring"
              hasDescription={false}
              className={cn("w-full")}
              footer={
                <>
                  <Button
                    variant="Secondary"
                    size="md"
                    onClick={() => {
                      // WHAT: Soft lock instead of immediate Clerk signOut.
                      setSessionActive(false);
                      onWarningChange?.(false);
                      performSoftLogout((url) => router.push(url));
                    }}
                  >
                    Log out
                  </Button>
                  <Button
                    variant="Primary"
                    size="md"
                    onClick={() => {
                      setSessionActive(true);
                      onWarningChange?.(false);
                    }}
                  >
                    Stay signed in
                  </Button>
                </>
              }
            >
              <p className="text-body-sm text-text-secondary">
                Your session will expire soon. Stay signed in to keep working.
              </p>
            </Modal>
          ) : null}

          {expired ? (
            <Modal
              title="Session expired"
              hasDescription={false}
              className="w-full"
              footer={
                <Button
                  variant="Primary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    // WHAT: Go to /sign-in — SignInResume offers Continue if still within grace.
                    router.push("/sign-in");
                  }}
                >
                  Log in again
                </Button>
              }
            >
              <p className="text-body-sm text-text-secondary">
                For your security, you were signed out. Log in to continue.
              </p>
            </Modal>
          ) : null}
        </div>
      </div>
    </div>
  );
}
