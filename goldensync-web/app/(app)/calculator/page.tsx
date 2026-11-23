"use client";

/**
 * Grade Calculator — P4 (Figma Calculator, C8 UI-110…116).
 * FLOW: scenario Proto → ResultCard + ActivityRows · Add activity · EditScore · switcher.
 * RULE: Estimated (self-reported); isGradeHidden from gradeScaleConfirmed.
 */

import { useRouter } from "next/navigation";
import * as React from "react";

import {
  ActivityRow,
  AppShell,
  Badge,
  Banner,
  Button,
  EmptyState,
  MobileDrawer,
  OutcomeRow,
  ResultCard,
  SegmentedControl,
  SubjectSwitcherPopover,
  Table,
  type SidebarActiveId,
} from "@/components/core";
import { EditScorePopover } from "@/components/features/calculator/edit-score-popover";
import {
  NewActivityDialog,
  type NewActivityValues,
} from "@/components/features/calculator/new-activity-dialog";
import { appendixA } from "@/copy";
import { goldenSyncSeed } from "@/data/seed";
import { useLiveData } from "@/hooks/use-live-data";
import { createAssessment, upsertScores } from "@/lib/api/subjects";
import { pathForNav } from "@/lib/nav";
import {
  useConflict,
  useGradeScaleConfirmed,
  useProtoActions,
  useScenario,
  useSubjectSelected,
  type ScenarioId,
} from "@/state";

const SCENARIO_OPTIONS = [
  { value: "PASSED", label: "PASSED" },
  { value: "INT_A", label: "INT_A" },
  { value: "UNDEFINED", label: "UNDEFINED" },
  { value: "INT_B", label: "INT_B" },
  { value: "FAILED", label: "FAILED" },
  { value: "INCOMPLETE", label: "INCOMPLETE" },
];

type LocalActivity = {
  id: string;
  activity: string;
  outcome: string;
  score: string;
  max: string;
  percent: string;
};

/** Calculator page — Proto scenarios + activity add/edit/conflict. */
export default function CalculatorPage() {
  const router = useRouter();
  const live = useLiveData();
  const subjectSelected = useSubjectSelected();
  const scenario = useScenario();
  const gradeScaleConfirmed = useGradeScaleConfirmed();
  const conflict = useConflict();
  const { setScenario, setConflict, setSubjectSelected } = useProtoActions();
  const seedActive = goldenSyncSeed.subjects.find((s) => s.isActive);
  const [liveSubjectId, setLiveSubjectId] = React.useState<string | null>(null);

  const liveSubjects = live.subjects.map((s) => ({
    id: s.id,
    code: s.courseCode,
    title: s.title,
  }));
  const useLive = live.signedIn && liveSubjects.length > 0;
  const active = useLive
    ? liveSubjects.find((s) => s.id === liveSubjectId) ?? liveSubjects[0]
    : seedActive;

  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [switcherOpen, setSwitcherOpen] = React.useState(false);
  const [newOpen, setNewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editInvalid, setEditInvalid] = React.useState(false);
  const [editing, setEditing] = React.useState<LocalActivity | null>(null);
  const [extra, setExtra] = React.useState<LocalActivity[]>([]);

  const firstLiveId = liveSubjects[0]?.id ?? null;
  React.useEffect(() => {
    if (!useLive || !firstLiveId || liveSubjectId) return;
    const handle = window.setTimeout(() => {
      setLiveSubjectId(firstLiveId);
      setSubjectSelected(true);
    }, 0);
    return () => window.clearTimeout(handle);
  }, [useLive, firstLiveId, liveSubjectId, setSubjectSelected]);

  const isGradeHidden = !gradeScaleConfirmed;
  const status =
    scenario === "INT_A"
      ? "INTERVENTION_A"
      : scenario === "INT_B"
        ? "INTERVENTION_B"
        : scenario === "UNDEFINED"
          ? "UNDEFINED_AT_THRESHOLD"
          : scenario === "FAILED"
            ? "FAILED"
            : "PASSED";

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, active?.id);
    if (path) router.push(path);
  }

  function openEdit(row: LocalActivity) {
    setEditing(row);
    setEditInvalid(false);
    setEditOpen(true);
  }

  async function handleSaveActivity(values: NewActivityValues) {
    const max = values.maxScore;
    let id = `extra-${Date.now()}`;
    if (useLive && active?.id) {
      try {
        const created = await createAssessment(active.id, {
          label: values.label,
          maxScore: max,
        });
        id = created.id;
      } catch {
        /* keep local row if API fails */
      }
    }
    setExtra((prev) => [
      ...prev,
      {
        id,
        activity: values.label,
        outcome: values.outcomes[0] ?? "—",
        score: "",
        max,
        percent: "—",
      },
    ]);
  }

  /** Persist score for live API assessment ids (cuid), not seed demo ids. */
  async function persistScore(row: LocalActivity, score: string, max: string) {
    if (!useLive || !active?.id) return;
    if (row.id === "q1" || row.id === "l1" || row.id.startsWith("extra-")) return;
    try {
      await upsertScores(active.id, [
        {
          assessmentId: row.id,
          version: null,
          score: score.trim() === "" ? null : score,
          max,
        },
      ]);
    } catch {
      setConflict(true);
    }
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected={subjectSelected}
        activeId="calculator"
        subjectCode={active?.code ?? "No subject"}
        subjectTitle={active?.title ?? "Choose a subject."}
        switcherOpen={switcherOpen}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        onSwitcherClick={() => setSwitcherOpen((o) => !o)}
        topBar={{
          title: "Grade Calculator",
          semesterLabel: goldenSyncSeed.semester.label,
          /* Figma P4 keeps SemesterPicker; Add Subject lives on Dashboard */
          hideAddSubject: true,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        {!subjectSelected ? (
          <EmptyState
            title="No subject selected"
            body={appendixA.calculator.empty}
            actionLabel="Add Subject"
            onAction={() => router.push("/dashboard")}
          />
        ) : (
          <div className="relative flex w-full flex-col gap-space-6">
            {switcherOpen ? (
              <div className="absolute top-0 left-0 z-40 md:left-[calc(240px+1rem)]">
                <SubjectSwitcherPopover
                  activeId={active?.id}
                  items={
                    useLive
                      ? liveSubjects
                      : goldenSyncSeed.subjects.map((s) => ({
                          id: s.id,
                          code: s.code,
                          title: s.title,
                        }))
                  }
                  onSubjectSelect={(id) => {
                    if (useLive) setLiveSubjectId(id);
                    setSwitcherOpen(false);
                  }}
                />
              </div>
            ) : null}

            <p className="text-overline uppercase text-text-muted">
              {active?.code} · {goldenSyncSeed.semester.label}
            </p>

            <div className="flex flex-col gap-space-2 rounded-lg border border-dashed border-border-strong p-space-3">
              <p className="text-caption uppercase text-text-muted">
                Prototype only — try another scenario
              </p>
              <SegmentedControl
                aria-label="Calculator scenario"
                value={scenario}
                options={SCENARIO_OPTIONS}
                onValueChange={(v) => setScenario(v as ScenarioId)}
              />
            </div>

            <div className="flex flex-col gap-space-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <Badge variant="Default">{appendixA.calculator.resultLabel}</Badge>
              <div className="flex w-full flex-col gap-space-2 sm:w-auto sm:flex-row">
                <Button
                  variant="Secondary"
                  size="md"
                  className="w-full min-h-12 sm:w-auto sm:min-h-11"
                  onClick={() => setNewOpen(true)}
                >
                  + Add activity
                </Button>
                <Button
                  variant="Ghost"
                  size="md"
                  className="w-full min-h-12 sm:w-auto sm:min-h-11"
                  onClick={() => router.push("/dashboard")}
                >
                  + Add Subject
                </Button>
              </div>
            </div>

            {conflict ? (
              <Banner
                variant="Warning"
                message={appendixA.calculator.conflict}
                hasAction
                actionLabel="Clear conflict"
                onAction={() => setConflict(false)}
                className="w-full"
              />
            ) : null}

            {scenario === "INCOMPLETE" ? (
              <div className="flex w-full flex-col gap-space-6">
                <p className="text-body-sm text-text-muted">
                  Incomplete — enter scores to see a result card.
                </p>
                <div className="relative w-full overflow-x-auto">
                  <Table header={false}>
                    <OutcomeRow
                      status="No scores"
                      hasProgress
                      scored="0 of 2 scored"
                      code="CO1"
                      description="Describe integration concepts and data formats"
                    />
                    <ActivityRow
                      activity="Quiz 1"
                      outcome="CO1"
                      state="Empty"
                      onScoreClick={() =>
                        openEdit({
                          id: "q1",
                          activity: "Quiz 1",
                          outcome: "CO1",
                          score: "",
                          max: "50",
                          percent: "—",
                        })
                      }
                    />
                    <ActivityRow activity="Lab 1" outcome="CO1" state="Empty" />
                  </Table>
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-space-8">
                <ResultCard
                  status={status}
                  isGradeHidden={isGradeHidden}
                  average={
                    status === "FAILED"
                      ? "51.25%"
                      : status === "INTERVENTION_B"
                        ? "55%"
                        : status === "UNDEFINED_AT_THRESHOLD"
                          ? "60%"
                          : status === "INTERVENTION_A"
                            ? "75%"
                            : "81.25%"
                  }
                  outcomesAttained={
                    status === "FAILED"
                      ? "1 of 4"
                      : status === "INTERVENTION_B" ||
                          status === "UNDEFINED_AT_THRESHOLD"
                        ? "2 of 4"
                        : status === "INTERVENTION_A"
                          ? "3 of 4"
                          : "4 of 4"
                  }
                  grade={
                    status === "FAILED"
                      ? "5.0"
                      : status === "INTERVENTION_B"
                        ? "3.0"
                        : status === "INTERVENTION_A"
                          ? "2.25"
                          : "1.75"
                  }
                  weakOutcomes={
                    status === "INTERVENTION_A"
                      ? [
                          {
                            code: "CO3",
                            topic: "Secure session handling",
                            percent: "55%",
                          },
                        ]
                      : status === "INTERVENTION_B"
                        ? [
                            {
                              code: "CO3",
                              topic: "Secure session handling",
                              percent: "40%",
                            },
                            {
                              code: "CO4",
                              topic: "Deployment and testing",
                              percent: "45%",
                            },
                          ]
                        : status === "FAILED"
                          ? [
                              {
                                code: "CO2",
                                topic: "Data validation",
                                percent: "40%",
                              },
                              {
                                code: "CO3",
                                topic: "Secure session handling",
                                percent: "45%",
                              },
                              {
                                code: "CO4",
                                topic: "Deployment and testing",
                                percent: "50%",
                              },
                            ]
                          : []
                  }
                />

                <div className="relative w-full overflow-x-auto">
                  <Table header={false}>
                    <OutcomeRow
                      status="Attained"
                      percent="85%"
                      hasProgress
                      scored="2 of 2 scored"
                      code="CO1"
                      description="Describe integration concepts and data formats"
                    />
                    <ActivityRow
                      activity="Quiz 1"
                      outcome="CO1"
                      score="45"
                      max="50"
                      percent="90%"
                      state={conflict ? "Conflict" : "Default"}
                      onScoreClick={() =>
                        openEdit({
                          id: "q1",
                          activity: "Quiz 1",
                          outcome: "CO1",
                          score: "45",
                          max: "50",
                          percent: "90%",
                        })
                      }
                    />
                    <ActivityRow
                      activity="Lab 1"
                      outcome="CO1"
                      score="40"
                      max="50"
                      percent="80%"
                      onScoreClick={() =>
                        openEdit({
                          id: "l1",
                          activity: "Lab 1",
                          outcome: "CO1",
                          score: "40",
                          max: "50",
                          percent: "80%",
                        })
                      }
                    />
                    <OutcomeRow
                      status="Excluded"
                      code="—"
                      description="Other activities"
                    />
                    <ActivityRow
                      activity="Class participation"
                      outcome="—"
                      score="9"
                      max="10"
                      percent="90%"
                    />
                    {extra.map((row) => (
                      <ActivityRow
                        key={row.id}
                        activity={row.activity}
                        outcome={row.outcome}
                        score={row.score || "—"}
                        max={row.max}
                        percent={row.percent}
                        state={row.score ? "Default" : "Empty"}
                        onScoreClick={() => openEdit(row)}
                      />
                    ))}
                  </Table>

                  {editOpen && editing ? (
                    <div className="absolute top-16 left-48 z-40">
                      <EditScorePopover
                        key={`${editing.id}-${editOpen}`}
                        open={editOpen}
                        activity={editing.activity}
                        max={Number(editing.max) || 50}
                        value={editing.score}
                        invalid={editInvalid}
                        conflict={conflict}
                        onClose={() => setEditOpen(false)}
                        onReloadConflict={() => setConflict(false)}
                        onSave={(score) => {
                          const n = score === "" ? null : Number(score);
                          if (
                            n !== null &&
                            (Number.isNaN(n) ||
                              n < 0 ||
                              n > Number(editing.max))
                          ) {
                            setEditInvalid(true);
                            return;
                          }
                          setExtra((prev) =>
                            prev.map((r) =>
                              r.id === editing.id
                                ? {
                                    ...r,
                                    score,
                                    percent:
                                      score === ""
                                        ? "—"
                                        : `${Math.round(
                                            (Number(score) /
                                              Number(editing.max)) *
                                              100,
                                          )}%`,
                                  }
                                : r,
                            ),
                          );
                          void persistScore(editing, score, editing.max);
                          setEditOpen(false);
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                <p className="text-caption text-text-muted">
                  {appendixA.calculator.unmapped}
                </p>
              </div>
            )}
          </div>
        )}
      </AppShell>

      <MobileDrawer
        open={drawerOpen}
        subjectSelected={subjectSelected}
        activeId="calculator"
        subjectCode={active?.code}
        subjectTitle={active?.title}
        switcherOpen={switcherOpen}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
        onSwitcherClick={() => setSwitcherOpen((o) => !o)}
      />

      <NewActivityDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onSave={(values) => {
          void handleSaveActivity(values);
        }}
      />
    </>
  );
}
