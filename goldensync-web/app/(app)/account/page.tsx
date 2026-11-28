"use client";

// WHAT: Settings page — profile, archived subjects, export, delete account.
// SCREEN: Route /account; semester switcher hidden in top bar.
// HOW: Clerk user for name; live API for export when signed in.

/**
 * Account — single full-width “Manage your account info” container.
 * FLOW: Sidebar Account → Profile · Birthday · History · Export · Delete.
 */

import { useClerk, useUser } from "@clerk/nextjs";
import { Download, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  Button,
  MobileDrawer,
  ToastHost,
  type SidebarActiveId,
  type ToastItem,
} from "@/components/core";
import { ArchivedSubjectsSection } from "@/components/features/account/archived-subjects-card";
import { DeleteAccountDialog } from "@/components/features/account/delete-account-dialog";
import { ProfileSection } from "@/components/features/account/profile-section";
import { goldenSyncSeed } from "@/data/seed";
import { useLiveData } from "@/hooks/use-live-data";
import { downloadAccountExport } from "@/lib/api/account";
import { clearSoftLock, performSoftLogout } from "@/lib/auth/soft-lock";
import { cn } from "@/lib/utils";
import { pathForNav } from "@/lib/nav";
import { useProtoActions } from "@/state";

function displayFullName(input: {
  fullName: string | null | undefined;
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  username: string | null | undefined;
  primaryEmail: string | null | undefined;
}): string {
  const full = (input.fullName ?? "").trim();
  if (full) return full;
  const parts = [input.firstName, input.lastName]
    .map((p) => (p ?? "").trim())
    .filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  const username = (input.username ?? "").trim();
  if (username) return username;
  const email = (input.primaryEmail ?? "").trim();
  if (email) return email;
  return "Not signed in";
}

export default function AccountPage() {
  const router = useRouter();
  const live = useLiveData();
  const { setSessionActive } = useProtoActions();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const liveActive = live.subjects[0];
  const seedActive = goldenSyncSeed.subjects.find((s) => s.isActive);
  const active = liveActive
    ? { id: liveActive.id, code: liveActive.courseCode, title: liveActive.title }
    : seedActive;

  const overlineName = isSignedIn
    ? displayFullName({
        fullName: user?.fullName,
        firstName: user?.firstName,
        lastName: user?.lastName,
        username: user?.username,
        primaryEmail: user?.primaryEmailAddress?.emailAddress,
      })
    : "Not signed in";

  async function handleNav(id: SidebarActiveId) {
    if (id === "logout") {
      // WHAT: Soft lock — keep Clerk session for 10 min; resume without password.
      setSessionActive(false);
      performSoftLogout((url) => router.push(url));
      return;
    }
    const path = pathForNav(id, active?.id);
    if (path) router.push(path);
  }

  function pushToast(message: string, variant: ToastItem["variant"] = "Success") {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }

  // WHAT: Downloads JSON/ZIP export blob via downloadAccountExport API.
  // RISK: Medium — requires sign-in; shows error toast on failure.
  async function handleExport() {
    if (!isSignedIn) {
      pushToast("Sign in to export your data.", "Error");
      return;
    }
    setExporting(true);
    try {
      const { filename, blob } = await downloadAccountExport();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      pushToast("Export downloaded.");
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Export failed.",
        "Error",
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected
        activeId="account"
        activeSubjectId={active?.id}
        subjectCode={active?.code}
        subjectTitle={active?.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Account",
          hideAddSubject: true,
          hideSemester: true,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        <div className="gs-fade-up flex w-full min-w-0 flex-1 flex-col gap-space-4">
          <p className="text-overline uppercase text-text-muted">
            {overlineName}
          </p>

          <div
            data-slot="gs-account-settings"
            className={cn(
              "glass-md flex w-full min-w-0 flex-1 flex-col gap-space-0 overflow-x-auto rounded-lg",
              "min-h-[min(100%,calc(100dvh-10rem))]",
            )}
          >
            <header className="flex w-full flex-col gap-space-1 border-b border-border-subtle px-space-4 py-space-4 sm:px-space-6 sm:py-space-5">
              <h2 className="text-heading-lg text-text-primary">Account</h2>
              <p className="text-body-sm text-text-muted">
                Manage your account info.
              </p>
            </header>

            <div className="flex w-full min-w-0 flex-1 flex-col gap-space-6 px-space-4 py-space-5 sm:gap-space-8 sm:px-space-6 sm:py-space-6">
              <ProfileSection />

              <div className="w-full border-t border-border-subtle pt-space-6">
                <ArchivedSubjectsSection enabled={Boolean(isSignedIn)} />
              </div>

              <section className="flex w-full flex-col gap-space-3 border-t border-border-subtle pt-space-6">
                <div className="flex w-full flex-col gap-space-1">
                  <h3 className="text-heading-md text-text-primary">
                    Export my data
                  </h3>
                  <p className="text-body-sm text-text-muted">
                    Download a copy of your subjects, plans and scores.
                  </p>
                </div>
                <Button
                  variant="Secondary"
                  size="md"
                  className="w-full sm:w-fit"
                  disabled={exporting}
                  onClick={() => void handleExport()}
                >
                  <Download className="size-4" aria-hidden />
                  {exporting ? "Exporting…" : "Export my data"}
                </Button>
              </section>

              <section className="flex w-full flex-col gap-space-3 border-t border-border-subtle pt-space-6">
                <div className="flex w-full flex-col gap-space-1">
                  <h3 className="text-heading-md text-text-primary">
                    Delete account
                  </h3>
                  <p className="text-body-sm text-text-muted">
                    Deletes your account and every subject you own. You will be
                    asked for your password.
                  </p>
                </div>
                <Button
                  variant="Destructive"
                  size="md"
                  className="w-full sm:w-fit"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" aria-hidden />
                  Delete account
                </Button>
              </section>
            </div>
          </div>
        </div>
      </AppShell>
      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="account"
        activeSubjectId={active?.id}
        subjectCode={active?.code}
        subjectTitle={active?.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
      <DeleteAccountDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={async () => {
          // WHAT: Account delete — clear soft lock and hard-sign out (no grace resume).
          setSessionActive(false);
          clearSoftLock();
          if (isSignedIn) {
            await signOut({ redirectUrl: "/sign-in" });
            return;
          }
          router.push("/sign-in");
        }}
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
