"use client";

/**
 * Live Grade Calculator — CO score cards + summary + passing dashboard.
 * FLOW: load/ensure grading template → hydrate local scores → Save Scores / Reset.
 */

import { RotateCcw, Save } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core";
import { CoPassingDashboard } from "@/components/features/calculator/co-passing-dashboard";
import { CoScoreCard } from "@/components/features/calculator/co-score-card";
import { GradeSummaryPanel } from "@/components/features/calculator/grade-summary-panel";
import { SemesterEstimatedFinalBar } from "@/components/features/calculator/semester-estimated-final-bar";
import { ApiClientError } from "@/lib/api/client";
import {
  ensureSubjectGradingTemplate,
  fetchSubjectDetail,
} from "@/lib/api/subjects";
import {
  clearCalculatorScores,
  loadCalculatorScores,
  mergeScoresOntoTemplate,
  saveCalculatorScores,
  templateTaskIds,
} from "@/lib/domain/calculator-scores-storage";
import {
  computeCalculatorSnapshot,
  defaultMaxScores,
  emptyYourScores,
} from "@/lib/domain/co-grade-calculator";
import {
  cloneGradingTemplate,
  DEFAULT_GRADING_TEMPLATE,
  type GradingTemplateDoc,
} from "@/lib/domain/grading-template";

export type GradeCalculatorPanelProps = {
  subjectId: string | null;
  live: boolean;
  subjectCode?: string;
  subjectTitle?: string;
};

function storageSubjectId(subjectId: string | null): string {
  if (subjectId?.trim()) return subjectId.trim();
  return "seed";
}

function applyTemplateScores(
  next: GradingTemplateDoc,
  storageId: string,
): {
  yourScores: Record<string, string>;
  maxScores: Record<string, string>;
} {
  const empty = emptyYourScores(next);
  const defaults = defaultMaxScores(next);
  const saved = loadCalculatorScores(storageId);
  return mergeScoresOntoTemplate(
    templateTaskIds(next),
    empty,
    defaults,
    saved,
  );
}

/** Full Scores / Grade Calculator view. */
export function GradeCalculatorPanel({
  subjectId,
  live,
  subjectCode = "",
  subjectTitle = "",
}: GradeCalculatorPanelProps) {
  const [template, setTemplate] = React.useState<GradingTemplateDoc | null>(
    () => (live ? null : cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE)),
  );
  const [yourScores, setYourScores] = React.useState(() =>
    live
      ? {}
      : applyTemplateScores(
          cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE),
          "seed",
        ).yourScores,
  );
  const [maxScores, setMaxScores] = React.useState(() =>
    live
      ? {}
      : applyTemplateScores(
          cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE),
          "seed",
        ).maxScores,
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saveLabel, setSaveLabel] = React.useState("Save Scores");
  const saveResetTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (saveResetTimer.current != null) {
        window.clearTimeout(saveResetTimer.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const storageId = storageSubjectId(subjectId);

    if (!live || !subjectId) {
      const defaults = cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE);
      const handle = window.setTimeout(() => {
        setTemplate(defaults);
        const merged = applyTemplateScores(defaults, storageId);
        setYourScores(merged.yourScores);
        setMaxScores(merged.maxScores);
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
          const next = await ensureSubjectGradingTemplate(
            subjectId,
            detail.grading,
          );
          if (cancelled) return;
          setTemplate(next);
          const merged = applyTemplateScores(next, storageId);
          setYourScores(merged.yourScores);
          setMaxScores(merged.maxScores);
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
    const storageId = storageSubjectId(subjectId);
    clearCalculatorScores(storageId);
    setYourScores(emptyYourScores(template));
    setMaxScores(defaultMaxScores(template));
    setSaveLabel("Save Scores");
  }

  function handleSaveScores() {
    if (!template) return;
    const storageId = storageSubjectId(subjectId);
    const ok = saveCalculatorScores(storageId, { yourScores, maxScores });
    setSaveLabel(ok ? "Saved" : "Save failed");
    if (saveResetTimer.current != null) {
      window.clearTimeout(saveResetTimer.current);
    }
    saveResetTimer.current = window.setTimeout(() => {
      setSaveLabel("Save Scores");
      saveResetTimer.current = null;
    }, 2000);
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-space-6 print:gap-space-4">
      <div className="flex flex-col gap-space-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-body-sm text-text-secondary">Grade Calculator</p>
          <p className="text-caption text-text-muted">
            {template
              ? "Live results from your CO assessment weights — Save Scores keeps them on this device"
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
            onClick={handleSaveScores}
          >
            <Save className="size-3.5" aria-hidden />
            {saveLabel}
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
          <SemesterEstimatedFinalBar
            snapshot={snapshot}
            subjectCode={subjectCode}
            subjectTitle={subjectTitle}
          />
        </>
      )}
    </div>
  );
}
