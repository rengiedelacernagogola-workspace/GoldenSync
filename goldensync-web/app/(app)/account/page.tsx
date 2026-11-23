"use client";

/**
 * Account — export + delete (Figma `144:4262`, UI-100).
 * FLOW: Sidebar Account → Export my data · Delete account confirm.
 * Clerk: UserButton when signed in; Log out signs out of Clerk when present.
 */

import { useClerk, useUser } from "@clerk/nextjs";
import { Download, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { ClerkAuthControls } from "@/components/auth/clerk-auth-controls";
import {
  AppShell,
  Button,
  Card,
  MobileDrawer,
  ToastHost,
  type SidebarActiveId,
  type ToastItem,
} from "@/components/core";
import { DeleteAccountDialog } from "@/components/features/account/delete-account-dialog";
import { goldenSyncSeed } from "@/data/seed";
import { pathForNav } from "@/lib/nav";
import { useProtoActions } from "@/state";

export default function AccountPage() {
  const router = useRouter();
  const { setSessionActive } = useProtoActions();
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const active = goldenSyncSeed.subjects.find((s) => s.isActive);

  async function handleNav(id: SidebarActiveId) {
    if (id === "logout") {
      setSessionActive(false);
      if (isSignedIn) {
        await signOut({ redirectUrl: "/sign-in" });
        return;
      }
      router.push("/sign-in");
      return;
    }
    const path = pathForNav(id, active?.id);
    if (path) router.push(path);
  }

  function handleExport() {
    const id = `export-${Date.now()}`;
    setToasts((prev) => [
      ...prev,
      {
        id,
        message: "Export queued (prototype).",
        variant: "Success",
      },
    ]);
    window.setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected
        activeId="account"
        subjectCode={active?.code}
        subjectTitle={active?.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Account",
          semesterLabel: goldenSyncSeed.semester.label,
          hideAddSubject: true,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        <div className="gs-fade-up flex w-full max-w-xl flex-col gap-space-6">
          <p className="text-overline uppercase text-text-muted">
            {active?.code ?? "—"} · {goldenSyncSeed.semester.label}
          </p>

          <Card title="Clerk session" hasHeader className="w-full">
            <div className="flex flex-col gap-space-3">
              <p className="text-body-sm text-text-muted">
                Sign in with Clerk. This is the default auth for GoldenSync.
              </p>
              <ClerkAuthControls />
            </div>
          </Card>

          <Card className="flex flex-col gap-space-4 p-space-6">
            <h2 className="text-heading-md text-text-primary">Export my data</h2>
            <p className="text-body-sm text-text-muted">
              Download a copy of your subjects, plans and scores.
            </p>
            <Button
              variant="Secondary"
              size="md"
              className="w-fit"
              onClick={handleExport}
            >
              <Download className="size-4" aria-hidden />
              Export my data
            </Button>
          </Card>

          <Card className="flex flex-col gap-space-4 p-space-6">
            <h2 className="text-heading-md text-text-primary">Delete account</h2>
            <p className="text-body-sm text-text-muted">
              Deletes your account and every subject you own. You will be asked
              for your password.
            </p>
            <Button
              variant="Destructive"
              size="md"
              className="w-fit"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" aria-hidden />
              Delete account
            </Button>
          </Card>
        </div>
      </AppShell>
      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="account"
        subjectCode={active?.code}
        subjectTitle={active?.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
      <DeleteAccountDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={async () => {
          setSessionActive(false);
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
