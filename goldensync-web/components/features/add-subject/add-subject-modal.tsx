"use client";

// WHAT: Full-screen flow to add a subject — PDF sync or manual multi-step form.
// SCREEN: Opened from Dashboard top bar, sidebar, or empty state.
// HOW: Phases upload → processing → form (steps 1–5) → created; optional live API.

/**
 * AddSubjectModal — PDF / Manual entry (Figma `85:1564`+, UI-072…078).
 * FLOW: Idle → Selected → Processing → Form steps 1–5 → Created.
 * RULE: When semesterId + signed-in → POST /api/subjects; else Proto demo save.
 * Proto: pdfOutcome · subjectCount (cap 20) · duplicateCode.
 */

import * as React from "react";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { Backdrop } from "@/components/core/backdrop";
import { Banner } from "@/components/core/banner";
import { Button } from "@/components/core/button";
import { DropZone, type DropZoneState } from "@/components/core/drop-zone";
import { Modal } from "@/components/core/modal";
import {
  PdfStepIndicator,
  type PdfStepState,
} from "@/components/core/pdf-step-indicator";
import { Tabs, type AddSubjectTab } from "@/components/core/tabs";
import { DuplicateSubjectDialog } from "@/components/features/add-subject/duplicate-subject-dialog";
import {
  defaultSubjectFormValues,
  SubjectFormSteps,
  type SubjectFormStepIndex,
  type SubjectFormValues,
} from "@/components/features/add-subject/subject-form-steps";
import { appendixA } from "@/copy";
import { ApiClientError } from "@/lib/api/client";
import {
  enqueueIngest,
  extractIngestDraft,
  pollIngestJob,
  uploadSyllabusPdf,
} from "@/lib/api/ingest";
import {
  createSubject,
  fetchMe,
  fetchSubjects,
} from "@/lib/api/semesters";
import { replaceSubject } from "@/lib/api/subjects";
import { normalizeCourseCode } from "@/lib/domain/course-code";
import {
  cloneGradingTemplate,
  DEFAULT_GRADING_TEMPLATE,
  serializeGradingTemplate,
  tryParseGradingTemplate,
} from "@/lib/domain/grading-template";
import {
  MAX_SUBJECTS,
  useDuplicateCode,
  usePdfOutcome,
  useProtoActions,
  useSaveOutcome,
  useSubjectCount,
  type PdfOutcome,
} from "@/state";

export type AddSubjectPhase =
  | "upload"
  | "processing"
  | "form"
  | "created"
  | "cap";

export interface AddSubjectModalProps {
  open?: boolean;
  onClose?: () => void;
  /** Called after create/replace; live path passes the subject id. */
  onCreated?: (subjectId?: string) => void;
  /** Active semester for live create; omit → Proto-only save. */
  semesterId?: string | null;
}

/** Map Proto pdfOutcome → reject / parse banner copy. */
function pdfErrorMessage(outcome: PdfOutcome): string | null {
  if (outcome === "ok") return null;
  if (
    outcome === "invalid" ||
    outcome === "toolarge" ||
    outcome === "encrypted" ||
    outcome === "ratelimited"
  ) {
    return appendixA.addSubject.rejectedFileCodes;
  }
  if (outcome === "scanned") {
    return "This PDF looks like a scan (no selectable text). Export a text PDF from Word/Google Docs, or use the Manual tab.";
  }
  if (outcome === "timeout") {
    return "Syllabus processing failed. Retry with a text-based PDF, or use the Manual tab.";
  }
  return null;
}

/**
 * Add Subject dialog — parent opens from TopBar / Sidebar / EmptyState.
 */
export function AddSubjectModal({
  open = false,
  onClose,
  onCreated,
  semesterId = null,
}: AddSubjectModalProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pdfOutcome = usePdfOutcome();
  const subjectCount = useSubjectCount();
  const duplicateCode = useDuplicateCode();
  const saveOutcome = useSaveOutcome();
  const {
    setPdfOutcome,
    setSubjectCount,
    setSubjectSelected,
    setDuplicateCode,
    setSaveOutcome,
  } = useProtoActions();

  const [tab, setTab] = React.useState<AddSubjectTab>("Upload");
  const [fileName, setFileName] = React.useState<string | undefined>();
  const [file, setFile] = React.useState<File | undefined>();
  const [phase, setPhase] = React.useState<AddSubjectPhase>("upload");
  const [pdfStep, setPdfStep] = React.useState<PdfStepState>("Uploading");
  const [fromPdf, setFromPdf] = React.useState(false);
  /** Syllabus-extracted weeks held until finishCreate. */
  const [ingestPlanWeeks, setIngestPlanWeeks] = React.useState<
    Array<{ weekNumber: number; topic?: string | null }>
  >([]);
  const [ingestOutcomes, setIngestOutcomes] = React.useState<
    Array<{ kind: "PEO" | "PO" | "CO"; code: string; description: string }>
  >([]);
  const [ingestAssessments, setIngestAssessments] = React.useState<
    Array<{ label: string; maxScore: string | null }>
  >([]);
  const [ingestGradingTemplate, setIngestGradingTemplate] = React.useState<
    ReturnType<typeof tryParseGradingTemplate>
  >(null);
  const [step, setStep] = React.useState<SubjectFormStepIndex>(1);
  const [values, setValues] = React.useState<SubjectFormValues>(() =>
    defaultSubjectFormValues(false),
  );
  const [showValidation, setShowValidation] = React.useState(false);
  const [dupOpen, setDupOpen] = React.useState(false);
  const [showReplaceSummary, setShowReplaceSummary] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [liveSaveError, setLiveSaveError] = React.useState(false);
  const [pendingReplace, setPendingReplace] = React.useState(false);
  const [replaceSummary, setReplaceSummary] = React.useState<string | null>(
    null,
  );
  const [createdSubjectId, setCreatedSubjectId] = React.useState<string | null>(
    null,
  );

  // WHAT: True when save should hit the real API (signed in + active semester).
  // RISK: Medium — without semesterId, create stays on proto/demo path only.
  const liveCreate = Boolean(isSignedIn && semesterId);
  const atCap = subjectCount >= MAX_SUBJECTS;
  /* Cap wins until Created — avoid setState-in-effect reset */
  const viewPhase: AddSubjectPhase =
    atCap && phase !== "created" ? "cap" : phase;
  const rejectMsg = pdfErrorMessage(pdfOutcome);
  const dropState: DropZoneState = rejectMsg
    ? "Error"
    : fileName
      ? "Selected"
      : "Idle";

  function clearIngestDraft() {
    setIngestPlanWeeks([]);
    setIngestOutcomes([]);
    setIngestAssessments([]);
    setIngestGradingTemplate(null);
  }

  function enterForm(pdf: boolean, patch?: Partial<SubjectFormValues>) {
    setFromPdf(pdf);
    if (!pdf) clearIngestDraft();
    setValues({ ...defaultSubjectFormValues(pdf), ...patch });
    setStep(1);
    setPhase("form");
  }

  /** Build Outcome rows from form peos/pos text + ingest draft (Sync-found). */
  function buildOutcomesPayload() {
    const rows: Array<{
      kind: "PEO" | "PO" | "CO";
      code: string;
      description: string;
      position: number;
    }> = [];
    const seen = new Set<string>();
    let position = 0;

    const pushOutcome = (
      kind: "PEO" | "PO" | "CO",
      code: string,
      description: string,
    ) => {
      const normalized = code.replace(/\s+/g, "").toUpperCase().slice(0, 24);
      if (!normalized || description.trim().length < 1) return;
      const key = `${kind}:${normalized}`;
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({
        kind,
        code: normalized,
        description: description.trim().slice(0, 500),
        position: position++,
      });
    };

    const pushLines = (kind: "PEO" | "PO", raw: string) => {
      /* Newlines only — PO descriptions contain commas ("Design, implement…"). */
      for (const part of raw.split(/\n+/)) {
        const line = part.trim();
        if (!line) continue;
        const m = line.match(
          /^((?:PEO|PO|CO)\s*[-.]?\s*\d{1,2}(?:-\(?[A-Z]{1,4}\)?)?)\s*(?:[:.)]\s*|[-–—]\s+)(?=[A-Za-z])(.*)$/i,
        );
        if (m) {
          const code = (m[1] ?? "")
            .replace(/[()]/g, "")
            .replace(/\s+/g, "")
            .replace(/–|—/g, "-")
            .toUpperCase();
          const description = (m[2] ?? "").trim() || line;
          pushOutcome(kind, code || `${kind}${position + 1}`, description);
        } else {
          pushOutcome(kind, `${kind}${position + 1}`, line);
        }
      }
    };
    pushLines("PEO", values.peos);
    pushLines("PO", values.pos);

    for (const o of ingestOutcomes) {
      pushOutcome(o.kind, o.code, o.description);
    }
    return rows;
  }

  const [uploadDetail, setUploadDetail] = React.useState<string | null>(null);

  function failUpload(code: PdfOutcome, detail?: string | null) {
    setPdfOutcome(code);
    setUploadDetail(detail ?? null);
    setPhase("upload");
    setFileName(undefined);
    setFile(undefined);
  }

  /** Map ingest/API failure codes → Proto pdfOutcome. */
  function mapIngestFail(code: string | null | undefined): PdfOutcome {
    if (code === "PDF_TOO_LARGE") return "toolarge";
    if (code === "RATE_LIMITED") return "ratelimited";
    if (code === "PDF_INVALID" || code === "PDF_ENCRYPTED") return "invalid";
    if (code === "PDF_SCANNED") return "scanned";
    if (code === "PARSE_TIMEOUT") return "timeout";
    return "timeout";
  }

  function detailFromJobResult(result: unknown): string | null {
    if (!result || typeof result !== "object") return null;
    const message = (result as { message?: unknown }).message;
    return typeof message === "string" && message.trim() ? message : null;
  }

  /**
   * Processing chain — live: Blob → ingest → poll; else proto /api/parse-syllabus.
   * Demo Panel pdfOutcome can still force reject without a file.
   */
  // WHAT: Runs PDF upload + ingest poll (live) or /api/parse-syllabus (demo).
  // HOW: On success, fills form state and sets phase to "form".
  async function startProcessing() {
    setPhase("processing");
    setPdfStep("Uploading");

    const advance = (stepState: PdfStepState) =>
      new Promise<void>((resolve) => {
        setPdfStep(stepState);
        window.setTimeout(resolve, 350);
      });

    /* Demo Panel can force failure paths without a real PDF */
    if (pdfOutcome !== "ok") {
      await advance("Uploading");
      failUpload(pdfOutcome);
      return;
    }

    if (!file) {
      await advance("Uploading");
      await advance("Extracting");
      await advance("Parsing");
      await advance("Complete");
      enterForm(true);
      return;
    }

    /* Live path: Blob + Trigger ingest */
    if (liveCreate) {
      try {
        setPdfStep("Uploading");
        const me = await fetchMe();
        const { pathname } = await uploadSyllabusPdf(me.id, file);
        await advance("Extracting");
        const job = await enqueueIngest(pathname);
        setPdfStep("Parsing");
        const done =
          job.status === "NEEDS_REVIEW" ||
          job.status === "FAILED" ||
          job.status === "CONFIRMED" ||
          job.status === "EXPIRED"
            ? job
            : await pollIngestJob(job.id);
        if (done.status === "FAILED") {
          failUpload(
            mapIngestFail(done.errorCode),
            detailFromJobResult(done.result),
          );
          return;
        }
        const draft = extractIngestDraft(done.result);
        const title =
          draft?.title ??
          draft?.previewLines?.[0]?.slice(0, 80) ??
          "";
        await advance("Complete");
        /* Empty manual defaults + draft patch — do not load seed ITE 14. */
        setFromPdf(true);
        setIngestPlanWeeks(
          Array.isArray(draft?.planWeeks)
            ? draft.planWeeks.filter(
                (w) =>
                  w &&
                  typeof w === "object" &&
                  Number.isFinite(Number(w.weekNumber)),
              )
            : [],
        );
        const draftOutcomes = Array.isArray(draft?.outcomes)
          ? draft.outcomes.filter(
              (o): o is { kind: "PEO" | "PO" | "CO"; code: string; description: string } =>
                !!o &&
                typeof o === "object" &&
                (o.kind === "PEO" || o.kind === "PO" || o.kind === "CO") &&
                typeof o.code === "string" &&
                typeof o.description === "string",
            )
          : [];
        setIngestOutcomes(draftOutcomes);
        setIngestAssessments(
          Array.isArray(draft?.assessments)
            ? draft.assessments.filter(
                (a): a is { label: string; maxScore: string | null } =>
                  !!a &&
                  typeof a === "object" &&
                  typeof a.label === "string" &&
                  a.label.trim().length > 0,
              )
            : [],
        );
        setIngestGradingTemplate(
          tryParseGradingTemplate(draft?.gradingTemplate ?? null),
        );
        const peos = draftOutcomes
          .filter((o) => o.kind === "PEO")
          .map((o) => `${o.code}: ${o.description}`)
          .join("\n");
        const pos = draftOutcomes
          .filter((o) => o.kind === "PO")
          .map((o) => `${o.code}: ${o.description}`)
          .join("\n");
        setValues({
          ...defaultSubjectFormValues(false),
          code: draft?.courseCode?.trim() || "",
          title: title || "",
          units:
            draft?.units != null && String(draft.units).trim()
              ? String(draft.units)
              : "3",
          prerequisite: draft?.prerequisite?.trim() || "",
          effectivity: draft?.effectivity?.trim() || "",
          peos: peos || "",
          pos: pos || "",
          grading: draft?.gradingBlurb?.trim() || "",
          policies: draft?.classPolicies?.trim() || "",
          facultyName: draft?.facultyName?.trim() || "",
        });
        setStep(1);
        setPhase("form");
        return;
      } catch (err) {
        if (err instanceof ApiClientError) {
          failUpload(mapIngestFail(err.code));
        } else {
          failUpload("timeout");
        }
        return;
      }
    }

    /* Proto / unsigned path — local parse API */
    await advance("Uploading");
    await advance("Extracting");
    await advance("Parsing");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/parse-syllabus", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as {
        ok: boolean;
        code?: string;
        previewLines?: string[];
      };
      if (!data.ok) {
        const allowed: PdfOutcome[] = [
          "invalid",
          "toolarge",
          "encrypted",
          "ratelimited",
          "scanned",
          "timeout",
        ];
        const code = allowed.includes(data.code as PdfOutcome)
          ? (data.code as PdfOutcome)
          : "invalid";
        failUpload(code);
        return;
      }
      await advance("Complete");
      const hint = data.previewLines?.[0]?.slice(0, 80) ?? "";
      enterForm(true, hint ? { title: hint } : undefined);
    } catch {
      failUpload("timeout");
    }
  }

  /** Persist subject — live API when signed in + semesterId; else Proto demo. */
  // WHAT: Final save — createSubject or replaceSubject on live path; proto delay otherwise.
  // EDIT: Payload shape must match API; duplicate code opens DuplicateSubjectDialog.
  async function finishCreate() {
    setSaving(true);
    setLiveSaveError(false);

    if (liveCreate && semesterId) {
      try {
        const payload = {
          courseCode: values.code.trim(),
          title: values.title.trim(),
          units: values.units.trim() || "3",
          prerequisite: values.prerequisite.trim() || null,
          effectivity: values.effectivity.trim() || null,
        };

        let nextId: string | null = null;
        if (pendingReplace) {
          const list = await fetchSubjects(semesterId);
          const norm = normalizeCourseCode(payload.courseCode);
          const existing = list.find((s) => s.courseCodeNorm === norm);
          if (!existing) {
            throw new ApiClientError(
              404,
              "NOT_FOUND",
              "Could not find the subject to replace.",
            );
          }
          const result = await replaceSubject(existing.id, payload);
          nextId = existing.id;
          setReplaceSummary(
            `${result.copied} scores copied, ${result.skipped} not copied.`,
          );
          setShowReplaceSummary(true);
          setPendingReplace(false);
        } else {
          const outcomes = buildOutcomesPayload();
          const policiesText = values.policies.trim();
          const gradingPayload = ingestGradingTemplate
            ? serializeGradingTemplate(ingestGradingTemplate)
            : serializeGradingTemplate(
                cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE),
              );
          const facultyName = values.facultyName.trim();
          const facultyCollege = values.facultyCollege.trim();
          const facultyConsultation = values.facultyConsultation.trim();
          const hoursRaw = values.estimatedContactHours.trim();
          const hours =
            hoursRaw !== "" && Number.isFinite(Number(hoursRaw))
              ? Number(hoursRaw)
              : null;
          const hasFaculty =
            facultyName ||
            facultyCollege ||
            facultyConsultation ||
            hours != null ||
            values.facultyTitle;

          const created = await createSubject({
            semesterId,
            ...payload,
            ...(ingestPlanWeeks.length > 0
              ? { planWeeks: ingestPlanWeeks }
              : {}),
            ...(outcomes.length > 0 ? { outcomes } : {}),
            ...(ingestAssessments.length > 0
              ? {
                  assessments: ingestAssessments.map((a, i) => ({
                    label: a.label,
                    maxScore: a.maxScore,
                    position: i,
                  })),
                }
              : {}),
            grading: gradingPayload,
            ...(policiesText || outcomes.length > 0
              ? {
                  policies: {
                    classPolicies: policiesText,
                    ...(outcomes.length > 0
                      ? {
                          outcomesSyllabus: {
                            vision: "",
                            mission: "",
                            graduateAttributes: "",
                            institutionalOutcomes: [],
                            peos: outcomes
                              .filter((o) => o.kind === "PEO")
                              .map((o) => ({
                                code: o.code,
                                description: o.description,
                              })),
                            pos: outcomes
                              .filter((o) => o.kind === "PO")
                              .map((o) => ({
                                code: o.code,
                                description: o.description,
                              })),
                            cos: outcomes
                              .filter((o) => o.kind === "CO")
                              .map((o) => ({
                                code: o.code,
                                description: o.description,
                              })),
                          },
                        }
                      : {}),
                  },
                }
              : {}),
            ...(hasFaculty
              ? {
                  faculty: {
                    title: values.facultyTitle || "",
                    name: facultyName,
                    college: facultyCollege,
                    consultation: facultyConsultation,
                    estimatedContactHours: hours,
                  },
                }
              : {}),
          });
          nextId = created.id;
          setSubjectCount(Math.min(MAX_SUBJECTS, subjectCount + 1));
        }
        setCreatedSubjectId(nextId);
        setSubjectSelected(true);
        setPhase("created");
        onCreated?.(nextId ?? undefined);
      } catch (err) {
        if (
          err instanceof ApiClientError &&
          err.code === "DUPLICATE_COURSE_CODE"
        ) {
          setDupOpen(true);
        } else if (
          err instanceof ApiClientError &&
          err.code === "LIMIT_REACHED"
        ) {
          setSubjectCount(MAX_SUBJECTS);
        } else {
          setLiveSaveError(true);
          setSaveOutcome("error");
        }
      } finally {
        setSaving(false);
      }
      return;
    }

    window.setTimeout(() => {
      setSaving(false);
      if (saveOutcome === "error") {
        return;
      }
      setSubjectCount(Math.min(MAX_SUBJECTS, subjectCount + 1));
      setSubjectSelected(true);
      setCreatedSubjectId(null);
      setPhase("created");
      onCreated?.();
    }, 400);
  }

  function openCreatedOverview() {
    const id = createdSubjectId;
    onClose?.();
    if (id) {
      router.push(`/subjects/${id}/overview`);
    }
  }

  function handleNext() {
    if (step === 1) {
      if (!values.code.trim() || !values.title.trim()) {
        setShowValidation(true);
        return;
      }
      if (duplicateCode) {
        setDupOpen(true);
        return;
      }
    }
    if (step < 5) {
      setStep((s) => (s + 1) as SubjectFormStepIndex);
      setShowValidation(false);
    }
  }

  if (!open) return null;

  return (
    <>
    <div data-slot="gs-add-subject-modal" className="fixed inset-0 z-50">
      <Backdrop onDismiss={onClose} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-space-4">
        <div className="pointer-events-auto w-full max-w-[960px]">
          <Modal
            title="Add Subject"
            hasDescription={false}
            onClose={onClose}
            className="w-full max-w-[960px]"
            footer={
              viewPhase === "upload" && tab === "Upload" ? (
                <>
                  <Button variant="Secondary" size="md" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="Primary"
                    size="md"
                    disabled={!fileName || Boolean(rejectMsg)}
                    onClick={startProcessing}
                  >
                    Sync Syllabus
                  </Button>
                </>
              ) : viewPhase === "upload" && tab === "Manual" ? (
                <>
                  <Button variant="Secondary" size="md" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="Primary"
                    size="md"
                    onClick={() => enterForm(false)}
                  >
                    Continue
                  </Button>
                </>
              ) : viewPhase === "form" ? (
                <>
                  <Button
                    variant="Secondary"
                    size="md"
                    onClick={() => {
                      if (step === 1) onClose?.();
                      else setStep((s) => (s - 1) as SubjectFormStepIndex);
                    }}
                  >
                    {step === 1 ? "Cancel" : "Back"}
                  </Button>
                  <div className="flex flex-col items-stretch gap-space-2 sm:flex-row sm:items-center">
                    {saving ? (
                      <p className="text-[11px] text-text-muted sm:mr-space-2">
                        First save can take a minute while the database wakes up.
                      </p>
                    ) : null}
                    <Button
                      variant="Primary"
                      size="md"
                      disabled={saving}
                      onClick={() => {
                        if (step === 5) void finishCreate();
                        else handleNext();
                      }}
                    >
                      {step === 5
                        ? saving
                          ? "Saving…"
                          : "Create subject"
                        : "Next"}
                    </Button>
                  </div>
                </>
              ) : viewPhase === "created" ? (
                <Button
                  variant="Primary"
                  size="md"
                  className="w-full"
                  onClick={openCreatedOverview}
                >
                  Open Overview
                </Button>
              ) : viewPhase === "cap" ? null : (
                <Button variant="Secondary" size="md" onClick={onClose}>
                  Cancel
                </Button>
              )
            }
          >
            <div className="flex w-full flex-col gap-space-4">
              {viewPhase === "cap" ? (
                <Banner
                  variant="Warning"
                  message={appendixA.addSubject.capReached}
                  hasAction={false}
                  className="w-full"
                />
              ) : null}

              {viewPhase === "created" ? (
                <Banner
                  variant="Success"
                  message={appendixA.addSubject.created}
                  hasAction={false}
                  className="w-full"
                />
              ) : null}

              {viewPhase === "upload" || viewPhase === "processing" ? (
                <>
                  {viewPhase === "upload" ? (
                    <Tabs
                      selected={tab}
                      onSelectedChange={(next) => {
                        setTab(next);
                        /* Skip empty Manual intro — go straight to Basics. */
                        if (next === "Manual") enterForm(false);
                      }}
                    />
                  ) : null}

                  {rejectMsg && viewPhase === "upload" ? (
                    <Banner
                      variant="Error"
                      message={
                        uploadDetail
                          ? `${rejectMsg} (${uploadDetail})`
                          : rejectMsg
                      }
                      className="w-full"
                      hasAction
                      actionLabel="Retry"
                      onAction={() => {
                        setPdfOutcome("ok");
                        setUploadDetail(null);
                        setFileName(undefined);
                        setFile(undefined);
                      }}
                    />
                  ) : null}

                  {tab === "Upload" && viewPhase === "upload" ? (
                    <DropZone
                      state={dropState}
                      fileName={fileName}
                      onFile={(f) => {
                        setPdfOutcome("ok");
                        setFile(f);
                        setFileName(f.name);
                      }}
                      onRemoveFile={() => {
                        setFile(undefined);
                        setFileName(undefined);
                      }}
                    />
                  ) : null}

                  {viewPhase === "processing" ? (
                    <PdfStepIndicator state={pdfStep} className="w-full" />
                  ) : null}
                </>
              ) : null}

              {viewPhase === "form" ? (
                <>
                  {showReplaceSummary ? (
                    <Banner
                      variant="Info"
                      message={
                        replaceSummary ?? appendixA.addSubject.replaceSummary
                      }
                      hasAction={false}
                      className="w-full"
                    />
                  ) : null}
                  {(saveOutcome === "error" || liveSaveError) && step === 5 ? (
                    <Banner
                      variant="Error"
                      message={appendixA.addSubject.saveError}
                      className="w-full"
                      hasAction
                      actionLabel="Retry"
                      onAction={() => {
                        setSaveOutcome("ok");
                        setLiveSaveError(false);
                        void finishCreate();
                      }}
                    />
                  ) : null}
                  {showValidation ? (
                    <Banner
                      variant="Error"
                      message={appendixA.addSubject.validationFailed}
                      hasAction={false}
                      className="w-full"
                    />
                  ) : null}
                  <SubjectFormSteps
                    step={step}
                    values={values}
                    fromPdf={fromPdf}
                    showValidation={showValidation}
                    onChange={(patch) =>
                      setValues((v) => ({ ...v, ...patch }))
                    }
                  />
                </>
              ) : null}
            </div>
          </Modal>
        </div>
      </div>
    </div>

    <DuplicateSubjectDialog
      open={dupOpen}
      subjectCode={values.code || "ITE 14"}
      showReplaceSummary={showReplaceSummary}
      onClose={() => setDupOpen(false)}
      onOpenExisting={() => {
        setDupOpen(false);
        setDuplicateCode(false);
        onClose?.();
      }}
      onReplace={() => {
        setPendingReplace(true);
        setShowReplaceSummary(true);
        setDuplicateCode(false);
        setDupOpen(false);
      }}
    />
    </>
  );
}
