"use client";

/**
 * Edit Subject — reuses SubjectFormSteps (C6/C7 manage subject).
 * FLOW: Sidebar Edit → form prefilled → PATCH /api/subjects/:id (+ outcomes when live).
 */

import { useParams, useRouter } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  Banner,
  Button,
  MobileDrawer,
  type SidebarActiveId,
} from "@/components/core";
import {
  defaultSubjectFormValues,
  SubjectFormSteps,
  type SubjectFormStepIndex,
  type SubjectFormValues,
} from "@/components/features/add-subject/subject-form-steps";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { ApiClientError } from "@/lib/api/client";
import { patchSubject, replaceOutcomes } from "@/lib/api/subjects";
import {
  parsePoliciesDoc,
  serializePoliciesDoc,
} from "@/lib/domain/course-spec";
import {
  parseFaculty,
  serializeFaculty,
} from "@/lib/domain/faculty";
import { pathForNav } from "@/lib/nav";

function EditBody() {
  const params = useParams();
  const router = useRouter();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);

  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [step, setStep] = React.useState<SubjectFormStepIndex>(1);
  const [values, setValues] = React.useState<SubjectFormValues>(() =>
    defaultSubjectFormValues(false),
  );
  const [hydrated, setHydrated] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!subject.ready || hydrated) return;
    const peos =
      subject.detail?.outcomes
        .filter((o) => o.kind === "PEO")
        .map((o) => o.description)
        .join(", ") ?? "";
    const pos =
      subject.detail?.outcomes
        .filter((o) => o.kind === "PO")
        .map((o) => o.description)
        .join(", ") ?? "";
    const next: SubjectFormValues = {
      ...defaultSubjectFormValues(false),
      code: subject.code,
      title: subject.title,
      units: subject.units,
      prerequisite: subject.prerequisite,
      effectivity: subject.effectivity,
      peos,
      pos,
      grading:
        typeof subject.detail?.grading === "string"
          ? subject.detail.grading
          : "",
      policies: parsePoliciesDoc(subject.detail?.policies).classPolicies,
      ...(() => {
        const faculty = parseFaculty(subject.detail?.faculty);
        return {
          facultyTitle: faculty.title,
          facultyName: faculty.name,
          facultyCollege: faculty.college,
          facultyConsultation: faculty.consultation,
          estimatedContactHours:
            faculty.estimatedContactHours != null
              ? String(faculty.estimatedContactHours)
              : "",
        };
      })(),
    };
    const handle = window.setTimeout(() => {
      setValues(next);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(handle);
  }, [subject, hydrated]);

  function handleNav(id: SidebarActiveId) {
    if (id === "edit-subject") return;
    const path = pathForNav(id, subject.id);
    if (path) router.push(path);
  }

  async function handleSave() {
    setError(null);
    if (!subject.live) {
      setSaved(true);
      return;
    }
    setSaving(true);
    try {
      const hoursRaw = values.estimatedContactHours.trim();
      const hoursNum =
        hoursRaw === "" ? null : Number(hoursRaw);
      const existingPolicies = parsePoliciesDoc(subject.detail?.policies);
      await patchSubject(subject.id, {
        courseCode: values.code.trim(),
        title: values.title.trim(),
        units: values.units.trim() || "3",
        prerequisite: values.prerequisite.trim() || null,
        effectivity: values.effectivity.trim() || null,
        grading: values.grading.trim() || null,
        policies: serializePoliciesDoc({
          classPolicies: values.policies.trim(),
          courseSpec: existingPolicies.courseSpec,
          outcomesSyllabus: existingPolicies.outcomesSyllabus,
        }),
        faculty: serializeFaculty({
          title: values.facultyTitle,
          name: values.facultyName,
          college: values.facultyCollege,
          consultation: values.facultyConsultation,
          estimatedContactHours:
            hoursNum != null && Number.isFinite(hoursNum) && hoursNum >= 0
              ? hoursNum
              : null,
        }),
      });

      const outcomes: Array<{
        kind: "PEO" | "PO" | "CO";
        code: string;
        description: string;
        position: number;
      }> = [];
      let pos = 0;
      for (const part of values.peos.split(",").map((s) => s.trim()).filter(Boolean)) {
        outcomes.push({
          kind: "PEO",
          code: `PEO${pos + 1}`,
          description: part,
          position: pos++,
        });
      }
      for (const part of values.pos.split(",").map((s) => s.trim()).filter(Boolean)) {
        outcomes.push({
          kind: "PO",
          code: `PO${outcomes.filter((o) => o.kind === "PO").length + 1}`,
          description: part,
          position: pos++,
        });
      }
      if (outcomes.length > 0) {
        await replaceOutcomes(subject.id, outcomes);
      }
      setSaved(true);
      subject.refresh();
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Could not save subject.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected
        activeId="edit-subject"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Edit Subject",
          semesterLabel: subject.semesterLabel,
          hideAddSubject: true,
          hideSemester: true,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        <div className="flex w-full max-w-2xl flex-col gap-space-6">
          {saved ? (
            <p className="text-body-sm text-status-success">
              Changes saved{subject.live ? "." : " (proto)."}
            </p>
          ) : null}
          {error ? (
            <Banner
              variant="Error"
              message={error}
              hasAction={false}
              className="w-full"
            />
          ) : null}
          <SubjectFormSteps
            step={step}
            values={values}
            fromPdf={subject.live}
            onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
          />
          <div className="flex gap-space-3">
            <Button
              variant="Secondary"
              size="md"
              onClick={() => {
                if (step === 1) router.push(`/subjects/${subject.id}/overview`);
                else setStep((s) => (s - 1) as SubjectFormStepIndex);
              }}
            >
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            <Button
              variant="Primary"
              size="md"
              disabled={saving}
              onClick={() => {
                if (step < 5) setStep((s) => (s + 1) as SubjectFormStepIndex);
                else void handleSave();
              }}
            >
              {step === 5 ? (saving ? "Saving…" : "Save") : "Next"}
            </Button>
          </div>
        </div>
      </AppShell>
      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="edit-subject"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

export default function EditSubjectPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Loading…
        </div>
      }
    >
      <EditBody />
    </React.Suspense>
  );
}
