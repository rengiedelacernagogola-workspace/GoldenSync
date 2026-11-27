"use client";

// WHAT: Empty state when a live subject has zero plan weeks on Checklist.
// SCREEN: Icon, copy, "Generate study weeks" + "Open Learning Plan" buttons.
// HOW: ensurePlanSkeleton(subjectId) then onGenerated refreshes parent data.
// KEEP: Never shows seed ITE weeks — live subjects only.

/**
 * Empty checklist for live subjects with no PlanWeek rows yet.
 * FLOW: Generate skeleton from semester dates · or open Learning Plan.
 */

import { CalendarRange, ListChecks } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/core/button";
import { ensurePlanSkeleton } from "@/lib/api/subjects";
import { cn } from "@/lib/utils";

export interface ChecklistEmptyPanelProps {
  subjectId: string;
  onGenerated?: () => void;
  className?: string;
}

/** Live-subject empty state — never shows seed ITE weeks. */
export function ChecklistEmptyPanel({
  subjectId,
  onGenerated,
  className,
}: ChecklistEmptyPanelProps) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // WHAT: Calls API to create week rows from semester dates; shows error on failure.
  async function handleGenerate() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await ensurePlanSkeleton(subjectId);
      onGenerated?.();
    } catch {
      setError("Could not generate weeks. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      data-slot="gs-checklist-empty"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-space-4 px-space-6 py-space-8 text-center",
        className,
      )}
    >
      <div
        aria-hidden
        className="flex size-16 items-center justify-center text-text-muted"
      >
        <ListChecks className="size-16" strokeWidth={1.25} />
      </div>
      <div className="flex max-w-md flex-col gap-space-2">
        <h3 className="text-heading-sm text-text-primary">
          No study weeks yet
        </h3>
        <p className="text-body-sm text-text-muted">
          Generate a week skeleton from your semester dates so you can tick
          progress, or open Learning Plan to add topics. Syllabus upload fills
          topics when you add a subject from PDF.
        </p>
      </div>
      {error ? (
        <p className="text-body-sm text-status-error">{error}</p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-space-3">
        <Button
          variant="Primary"
          size="md"
          disabled={busy}
          onClick={() => {
            void handleGenerate();
          }}
        >
          <CalendarRange className="size-4" strokeWidth={1.75} />
          {busy ? "Generating…" : "Generate study weeks"}
        </Button>
        <Button
          variant="Secondary"
          size="md"
          onClick={() => router.push(`/subjects/${subjectId}/plan`)}
        >
          Open Learning Plan
        </Button>
      </div>
    </div>
  );
}
