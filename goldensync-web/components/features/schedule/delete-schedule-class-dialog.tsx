"use client";

/**
 * WHAT: Confirm before permanently deleting a schedule class.
 * SCREEN: Delete dialog on /my-schedule — full-width actions on phone.
 * RISK: Medium — irreversible for that row.
 */

import * as React from "react";

import { Backdrop } from "@/components/core/backdrop";
import { Button } from "@/components/core/button";
import { Modal } from "@/components/core/modal";
import { cn } from "@/lib/utils";

export interface DeleteScheduleClassDialogProps {
  open: boolean;
  courseCode?: string;
  courseTitle?: string;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function DeleteScheduleClassDialog({
  open,
  courseCode = "",
  courseTitle = "",
  saving = false,
  error = null,
  onClose,
  onConfirm,
}: DeleteScheduleClassDialogProps) {
  const [isNarrow, setIsNarrow] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!open) return null;

  return (
    <div data-slot="gs-delete-schedule-class" className="fixed inset-0 z-50">
      <Backdrop onDismiss={saving ? undefined : onClose} />
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-space-3 sm:items-center sm:p-space-4">
        <div className="pointer-events-auto w-full max-w-md">
          <Modal
            variant={isNarrow ? "Mobile" : "Desktop"}
            className={cn(
              isNarrow &&
                "h-auto max-h-[85dvh] max-w-none rounded-t-xl border border-border-strong",
            )}
            title="Delete class"
            description={`Remove ${courseCode}${courseTitle ? ` — ${courseTitle}` : ""} from your schedule? This cannot be undone.`}
            onClose={saving ? undefined : onClose}
            footer={
              <>
                <Button
                  variant="Secondary"
                  size={isNarrow ? "lg" : "md"}
                  className={isNarrow ? "w-full" : undefined}
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="Destructive"
                  size={isNarrow ? "lg" : "md"}
                  className={isNarrow ? "w-full" : undefined}
                  onClick={() => void onConfirm()}
                  disabled={saving}
                >
                  {saving ? "Deleting…" : "Delete"}
                </Button>
              </>
            }
          >
            {error ? (
              <p className="py-space-3 text-body-sm text-status-error" role="alert">
                {error}
              </p>
            ) : (
              <p className="py-space-3 text-body-sm text-text-secondary">
                The class will be removed from every day tab.
              </p>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
}
