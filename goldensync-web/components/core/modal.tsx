"use client";

// WHAT: Dialog chrome — header (optional headerActions), scroll body, footer.
// SCREEN: Parent wraps with Backdrop + centering (see AddSubjectModal / Add Class).
// KEEP: Focus trap / Escape may live in host — this file is layout only.

/**
 * Modal — dialog shell (Figma `24:508`, UI-025).
 * Desktop glass-lg 640 (max 960) · Mobile full screen. No glass inside body (C8).
 * RULE: glass-lg uses solid bg-overlay so dialogs stay readable over dashboard.
 * Flow: focus trap + Escape close live in the host; this file is layout only.
 */

import { X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import { cn } from "@/lib/utils";

export type ModalVariant = "Desktop" | "Mobile";

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ModalVariant;
  title?: string;
  description?: string;
  hasDescription?: boolean;
  hasFooter?: boolean;
  hasTertiary?: boolean;
  footer?: React.ReactNode;
  /**
   * WHAT: Optional actions in the header top-right (before the close X).
   * SCREEN: e.g. Cancel + Save on Add Class.
   */
  headerActions?: React.ReactNode;
  onClose?: () => void;
}

/** Dialog panel — put form/upload bodies in children; edit copy in copy/. */
export function Modal({
  className,
  variant = "Desktop",
  title = "Dialog title",
  description = "Short description of what this dialog does.",
  hasDescription = true,
  hasFooter = true,
  hasTertiary = false,
  footer,
  headerActions,
  onClose,
  children,
  ...props
}: ModalProps) {
  const isMobile = variant === "Mobile";
  const titleId = React.useId();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-slot="gs-modal"
      data-variant={variant}
      className={cn(
        "relative z-50 flex flex-col items-start overflow-hidden",
        /* Solid elevated fill — opaque over dimmed dashboard (not translucent glass) */
        "border border-border-strong bg-bg-muted shadow-hover gs-overlay-in",
        "shadow-[0_16px_64px_#00000099,0_0_0_1px_#ffffff14]",
        isMobile
          ? "h-full w-full max-w-[375px] rounded-none border-0"
          : "w-full max-w-[640px] rounded-xl",
        className,
      )}
      {...props}
    >
      <div
        data-slot="gs-modal-header"
        className={cn(
          "relative flex w-full shrink-0 items-start gap-space-3 border-b border-border-subtle sm:gap-space-4",
          isMobile ? "p-space-4" : "pt-space-6 pr-space-4 pb-space-4 pl-space-6",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col items-start gap-space-1 pt-space-2">
          <h2
            id={titleId}
            className="text-heading-md text-text-primary sm:whitespace-nowrap"
          >
            {title}
          </h2>
          {hasDescription ? (
            <p className="w-full text-ui-sm text-text-muted">{description}</p>
          ) : null}
        </div>
        {/* WHAT: Optional Cancel/Save (or similar) sit left of the close control. */}
        {headerActions ? (
          <div
            data-slot="gs-modal-header-actions"
            className="flex shrink-0 flex-wrap items-center justify-end gap-space-2 pt-space-1"
          >
            {headerActions}
          </div>
        ) : null}
        <Button
          variant="IconOnly"
          size="md"
          aria-label="Close dialog"
          onClick={onClose}
          className="shrink-0"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </div>

      <div
        data-slot="gs-modal-body"
        className={cn(
          "relative min-h-0 w-full flex-1 overflow-x-clip overflow-y-auto",
          isMobile ? "px-space-4" : "px-space-6",
        )}
      >
        {children ?? (
          <div className="flex w-full flex-col py-space-6">
            <p className="text-caption text-text-muted">Content slot</p>
          </div>
        )}
      </div>

      {hasFooter ? (
        <div
          data-slot="gs-modal-footer"
          className={cn(
            "relative flex w-full shrink-0 border-t border-border-subtle",
            isMobile
              ? "flex-col items-stretch gap-space-3 px-space-4 pt-space-4 pb-space-6"
              : "items-center justify-end gap-space-3 px-space-6 py-space-4",
          )}
        >
          {footer ?? (
            <>
              {hasTertiary ? (
                <Button
                  variant="Ghost"
                  size={isMobile ? "lg" : "md"}
                  className={isMobile ? "w-full" : undefined}
                >
                  Button
                </Button>
              ) : null}
              {!isMobile ? (
                <>
                  <Button variant="Secondary" size="md">
                    Button
                  </Button>
                  <Button variant="Primary" size="md">
                    Button
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="Primary" size="lg" className="w-full">
                    Button
                  </Button>
                  <Button variant="Secondary" size="lg" className="w-full">
                    Button
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
