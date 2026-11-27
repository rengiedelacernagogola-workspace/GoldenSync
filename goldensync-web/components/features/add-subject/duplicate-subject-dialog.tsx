"use client";

// WHAT: Modal when user adds a subject whose course code already exists.
// SCREEN: "Open existing" vs "Replace" — optional info banner after replace.
// HOW: showReplaceSummary toggles Appendix A replace-summary banner inside modal.
// EDIT: Parent handles onOpenExisting / onReplace navigation and API.

/**
 * DuplicateSubjectDialog — subject code collision (Figma `95:8385`, UI-077).
 * FLOW: Open existing → Overview · Replace → replace summary then Create.
 */

import * as React from "react";

import { Backdrop } from "@/components/core/backdrop";
import { Banner } from "@/components/core/banner";
import { Button } from "@/components/core/button";
import { Modal } from "@/components/core/modal";
import { appendixA } from "@/copy";

export interface DuplicateSubjectDialogProps {
  open?: boolean;
  subjectCode?: string;
  /** Shown after Replace — "N scores copied, M not copied." */
  showReplaceSummary?: boolean;
  onClose?: () => void;
  onOpenExisting?: () => void;
  onReplace?: () => void;
}

// WHAT: Renders backdrop + modal only when open prop is true.
/** Confirm open-or-replace when duplicateCode Proto is true. */
export function DuplicateSubjectDialog({
  open = false,
  subjectCode = "ITE 14",
  showReplaceSummary = false,
  onClose,
  onOpenExisting,
  onReplace,
}: DuplicateSubjectDialogProps) {
  if (!open) return null;

  return (
    <div data-slot="gs-duplicate-subject-dialog" className="fixed inset-0 z-[60]">
      <Backdrop onDismiss={onClose} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-space-4">
        <div className="pointer-events-auto w-full max-w-md">
          <Modal
            title="Subject already exists"
            description={`An active subject with this course code (${subjectCode}) already exists in this semester.`}
            onClose={onClose}
            footer={
              <>
                <Button variant="Secondary" size="md" onClick={onOpenExisting}>
                  Open existing
                </Button>
                <Button variant="Primary" size="md" onClick={onReplace}>
                  Replace
                </Button>
              </>
            }
          >
            {showReplaceSummary ? (
              <Banner
                variant="Info"
                message={appendixA.addSubject.replaceSummary}
                hasAction={false}
                className="w-full"
              />
            ) : null}
          </Modal>
        </div>
      </div>
    </div>
  );
}
