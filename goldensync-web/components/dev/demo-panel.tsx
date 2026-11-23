"use client";

/**
 * DemoPanel — Proto controls (Figma page 07, C10).
 * FLOW: flip Proto fields to preview screens without real backend.
 * Mount on /dev/demo or beside authenticated pages in prototype.
 */

import * as React from "react";

import { Button } from "@/components/core/button";
import {
  useProtoActions,
  useProtoState,
  type LoginOutcome,
  type PdfOutcome,
  type SaveOutcome,
  type ScenarioId,
  type WeekState,
} from "@/state";
import { cn } from "@/lib/utils";

const LOGIN: LoginOutcome[] = ["success", "wrong", "throttled"];
const PDF: PdfOutcome[] = [
  "ok",
  "invalid",
  "toolarge",
  "encrypted",
  "ratelimited",
  "scanned",
  "timeout",
];
const SAVE: SaveOutcome[] = ["ok", "error"];
const SCENARIOS: ScenarioId[] = [
  "PASSED",
  "INT_A",
  "UNDEFINED",
  "INT_B",
  "FAILED",
  "INCOMPLETE",
];
const WEEKS: WeekState[] = [
  "normal",
  "before_start",
  "after_end",
  "no_class",
  "no_plan",
];

/** Compact Proto switcher for QA — edit allowed values in proto-types. */
export function DemoPanel({ className }: { className?: string }) {
  const state = useProtoState();
  const actions = useProtoActions();
  /* Start collapsed so Proto controls do not cover smoke screens */
  const [open, setOpen] = React.useState(false);

  if (!open) {
    return (
      <button
        type="button"
        data-slot="gs-demo-panel-fab"
        className="fixed right-4 bottom-4 z-[70] rounded-md border border-border-strong bg-bg-overlay px-space-3 py-space-2 text-caption text-text-secondary"
        onClick={() => setOpen(true)}
      >
        Proto
      </button>
    );
  }

  return (
    <aside
      data-slot="gs-demo-panel"
      className={cn(
        "fixed right-4 bottom-4 z-[70] flex max-h-[70vh] w-72 flex-col gap-space-3 overflow-auto",
        "rounded-lg border border-border-strong bg-bg-overlay p-space-4 shadow-hover",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-space-2">
        <p className="text-overline uppercase text-text-muted">Demo Panel</p>
        <Button
          variant="Ghost"
          size="sm"
          onClick={() => setOpen(false)}
          aria-label="Collapse demo panel"
        >
          Hide
        </Button>
      </div>

      <Field label="sessionActive">
        <Toggle
          value={state.sessionActive}
          onChange={actions.setSessionActive}
        />
      </Field>
      <Field label="hasSemester">
        <Toggle value={state.hasSemester} onChange={actions.setHasSemester} />
      </Field>
      <Field label="subjectSelected">
        <Toggle
          value={state.subjectSelected}
          onChange={actions.setSubjectSelected}
        />
      </Field>
      <Field label="subjectCount">
        <input
          type="number"
          min={0}
          max={20}
          value={state.subjectCount}
          onChange={(e) => actions.setSubjectCount(Number(e.target.value))}
          className="w-full rounded-md border border-border-default bg-bg-subtle px-space-2 py-space-1 font-mono text-mono-sm text-text-primary"
        />
      </Field>
      <Field label="loginOutcome">
        <Select
          value={state.loginOutcome}
          options={LOGIN}
          onChange={(v) => actions.setLoginOutcome(v as LoginOutcome)}
        />
      </Field>
      <Field label="loginFailCount">
        <input
          type="number"
          min={0}
          max={5}
          value={state.loginFailCount}
          onChange={(e) => actions.setLoginFailCount(Number(e.target.value))}
          className="w-full rounded-md border border-border-default bg-bg-subtle px-space-2 py-space-1 font-mono text-mono-sm text-text-primary"
        />
      </Field>
      <Field label="pdfOutcome">
        <Select
          value={state.pdfOutcome}
          options={PDF}
          onChange={(v) => actions.setPdfOutcome(v as PdfOutcome)}
        />
      </Field>
      <Field label="saveOutcome">
        <Select
          value={state.saveOutcome}
          options={SAVE}
          onChange={(v) => actions.setSaveOutcome(v as SaveOutcome)}
        />
      </Field>
      <Field label="scenario">
        <Select
          value={state.scenario}
          options={SCENARIOS}
          onChange={(v) => actions.setScenario(v as ScenarioId)}
        />
      </Field>
      <Field label="weekState">
        <Select
          value={state.weekState}
          options={WEEKS}
          onChange={(v) => actions.setWeekState(v as WeekState)}
        />
      </Field>
      <Field label="gradeScaleConfirmed">
        <Toggle
          value={state.gradeScaleConfirmed}
          onChange={actions.setGradeScaleConfirmed}
        />
      </Field>
      <Field label="duplicateCode">
        <Toggle
          value={state.duplicateCode}
          onChange={actions.setDuplicateCode}
        />
      </Field>
      <Field label="conflict">
        <Toggle value={state.conflict} onChange={actions.setConflict} />
      </Field>
      <Button
        variant="Ghost"
        size="sm"
        className="w-full"
        onClick={() => {
          const url = new URL(window.location.href);
          if (url.searchParams.get("empty") === "1") {
            url.searchParams.delete("empty");
          } else {
            url.searchParams.set("empty", "1");
          }
          window.location.assign(url.toString());
        }}
      >
        Toggle emptyModule (?empty=1)
      </Button>

      <Button
        variant="Secondary"
        size="sm"
        className="w-full"
        onClick={() => actions.resetToDefaults()}
      >
        Reset Proto defaults
      </Button>
    </aside>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-space-1">
      <span className="font-mono text-mono-sm text-text-muted">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        "h-8 w-full rounded-md border px-space-2 text-left text-body-sm",
        value
          ? "border-accent-glass-border bg-accent-glass-bg text-accent-primary"
          : "border-border-default bg-bg-subtle text-text-secondary",
      )}
    >
      {value ? "true" : "false"}
    </button>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-border-default bg-bg-subtle px-space-2 py-space-1 font-mono text-mono-sm text-text-primary"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
