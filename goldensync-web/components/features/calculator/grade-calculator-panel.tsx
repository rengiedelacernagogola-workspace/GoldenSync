"use client";

/**
 * Live Grade Calculator — CO score cards + summary + passing dashboard.
 * FLOW: load grading template shape → local score state → computeCalculatorSnapshot.
 * Live subjects with no saved grading stay empty until template exists.
 */

import { Printer, RotateCcw } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core";
import { CoPassingDashboard } from "@/components/features/calculator/co-passing-dashboard";
import { CoScoreCard } from "@/components/features/calculator/co-score-card";
import { GradeSummaryPanel } from "@/components/features/calculator/grade-summary-panel";
import { ApiClientError } from "@/lib/api/client";
import { fetchSubjectDetail } from "@/lib/api/subjects";
import {
  computeCalculatorSnapshot,
  defaultMaxScores,
  emptyYourScores,
} from "@/lib/domain/co-grade-calculator";
import {
  cloneGradingTemplate,
  DEFAULT_GRADING_TEMPLATE,
  tryParseGradingTemplate,
  type GradingTemplateDoc,
} from "@/lib/domain/grading-template";

export type GradeCalculatorPanelProps = {
  subjectId: string | null;
  live: boolean;
};

/** Full Scores / Grade Calculator view. */
export function GradeCalculatorPanel({
  subjectId,
  live,
}: GradeCalculatorPanelProps) {
  const [template, setTemplate] = React.useState<GradingTemplateDoc | null>(
    () => (live ? null : cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE)),
  );
  const [yourScores, setYourScores] = React.useState(() =>
    live ? {} : emptyYourScores(DEFAULT_GRADING_TEMPLATE),
  );
  const [maxScores, setMaxScores] = React.useState(() =>
    live ? {} : defaultMaxScores(DEFAULT_GRADING_TEMPLATE),
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!live || !subjectId) {
      const defaults = cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE);
      const handle = window.setTimeout(() => {
        setTemplate(defaults);
        setYourScores(emptyYourScores(defaults));
        setMaxScores(defaultMaxScores(defaults));
        setError(null);
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(handle);
    }

    let cancelled = false;
    setLoading(true);
    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const detail = await fetchSubjectDetail(subjectId);
          if (cancelled) return;
          const next = tryParseGradingTemplate(detail.grading);
          setTemplate(next);
          if (next) {
            setYourScores(emptyYourScores(next));
            setMaxScores(defaultMaxScores(next));
          } else {
            setYourScores({});
            setMaxScores({});
          }
          setError(null);
        } catch (err) {
          if (cancelled) return;
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Could not load grading structure.",
          );
          setTemplate(null);
          setYourScores({});
          setMaxScores({});
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [live, subjectId]);

  const snapshot = React.useMemo(
    () =>
      template
        ? computeCalculatorSnapshot(template, { yourScores, maxScores })
        : null,
    [template, yourScores, maxScores],
  );

  function resetAll() {
    if (!template) return;
    setYourScores(emptyYourScores(template));
    setMaxScores(defaultMaxScores(template));
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-space-6 print:gap-space-4">
      <div className="flex flex-col gap-space-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-body-sm text-text-secondary">Grade Calculator</p>
          <p className="text-caption text-text-muted">
            {template
              ? "Live results from your CO assessment weights — scores stay on this device"
              : "Save a Grading System template first to run the calculator"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-2">
          <Button
            variant="Ghost"
            size="md"
            disabled={!template}
            onClick={resetAll}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset All
          </Button>
          <Button
            variant="Secondary"
            size="md"
            disabled={!template}
            onClick={handlePrint}
          >
            <Printer className="size-3.5" aria-hidden />
            Print / Export
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-caption text-status-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-body-sm text-text-muted">Loading calculator…</p>
      ) : !template || !snapshot ? (
        <p className="text-body-sm text-text-muted">
          No grading template on this subject yet. Open the Grading System tab
          and use the default template, or Sync a syllabus that includes grading.
        </p>
      ) : (
        <>
          {snapshot.cos.map((co) => (
            <CoScoreCard
              key={co.groupId}
              result={co}
              yourScores={yourScores}
              maxScores={maxScores}
              onYourScoreChange={(taskId, value) =>
                setYourScores((prev) => ({ ...prev, [taskId]: value }))
              }
              onMaxScoreChange={(taskId, value) =>
                setMaxScores((prev) => ({ ...prev, [taskId]: value }))
              }
            />
          ))}

          <GradeSummaryPanel snapshot={snapshot} />
          <CoPassingDashboard snapshot={snapshot} />
        </>
      )}
    </div>
  );
}
