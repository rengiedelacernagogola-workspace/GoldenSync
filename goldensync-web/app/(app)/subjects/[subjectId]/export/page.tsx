"use client";

/**
 * Export — CSV / JSON download (Figma `137:2631`, UI-096).
 * FLOW: Format segmented → GET /api/subjects/:id/export (live) or proto toast.
 */

import { Download } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  Banner,
  Button,
  Card,
  MobileDrawer,
  SegmentedControl,
  ToastHost,
  type SidebarActiveId,
  type ToastItem,
} from "@/components/core";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { downloadSubjectExport } from "@/lib/api/subjects";
import { pathForNav } from "@/lib/nav";

function ExportBody() {
  const params = useParams();
  const router = useRouter();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);

  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [format, setFormat] = React.useState("CSV");
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [saving, setSaving] = React.useState(false);

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, subject.id);
    if (path) router.push(path);
  }

  function pushToast(message: string, variant: ToastItem["variant"] = "Success") {
    const id = `export-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }

  async function handleDownload() {
    const fmt = format.toLowerCase() === "json" ? "json" : "csv";
    if (subject.live) {
      setSaving(true);
      try {
        const { filename, blob } = await downloadSubjectExport(subject.id, fmt);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        pushToast(`${subject.code} exported as ${format}.`);
      } catch (err) {
        pushToast(
          err instanceof Error ? err.message : "Export failed.",
          "Error",
        );
      } finally {
        setSaving(false);
      }
      return;
    }
    pushToast(`${subject.code} export queued as ${format} (prototype).`);
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected
        activeId="export"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Export",
          semesterLabel: subject.semesterLabel,
          hideAddSubject: true,
          hideSemester: true,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        <div className="gs-fade-up flex w-full max-w-xl flex-col gap-space-6">
          <p className="text-overline uppercase text-text-muted">
            {subject.code} · {subject.semesterLabel}
            {subject.live ? " · Live" : ""}
          </p>
          <Card
            title="Export subject data"
            hasHeader
            className="flex flex-col gap-space-5"
          >
            <div className="flex flex-col gap-space-2">
              <p className="text-body-sm font-medium text-text-secondary">
                Format
              </p>
              <SegmentedControl
                aria-label="Export format"
                value={format}
                options={[
                  { value: "CSV", label: "CSV" },
                  { value: "JSON", label: "JSON" },
                ]}
                onValueChange={setFormat}
              />
            </div>
            <Banner
              variant="Info"
              message="Only your own subject is exported. Cells starting with = + - @ are neutralized."
              hasAction={false}
              className="w-full"
            />
            <Button
              variant="Primary"
              size="md"
              disabled={saving}
              onClick={() => void handleDownload()}
            >
              <Download className="size-4" aria-hidden />
              {saving ? "Downloading…" : "Download"}
            </Button>
          </Card>
        </div>
      </AppShell>
      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="export"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
      <ToastHost
        toasts={toasts}
        onDismiss={(id) =>
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }
      />
    </>
  );
}

export default function ExportPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Loading…
        </div>
      }
    >
      <ExportBody />
    </React.Suspense>
  );
}
