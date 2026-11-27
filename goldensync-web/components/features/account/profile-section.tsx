"use client";

// WHAT: Clerk profile UI plus custom birthday stored in user metadata.
// SCREEN: Account page — Profile and Birthday sections.
// HOW: useUser for auth; birthday via user.update({ unsafeMetadata }).
// EDIT: Clerk appearance tokens map to CSS vars — match theme in variables/elements.
// RISK: Birthday is unsafeMetadata (client-writable) — not for secrets.

/**
 * Account profile fields — Clerk UserProfile (name / photo / password) + birthday.
 * Renders as sections (no outer Card); parent Account page owns the single container.
 */

import { UserProfile, useUser } from "@clerk/nextjs";
import * as React from "react";

import { Button, Input } from "@/components/core";

function birthdayFromMetadata(raw: unknown): string {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return "";
  const value = (raw as Record<string, unknown>).birthday;
  return typeof value === "string" ? value : "";
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex w-full flex-col gap-space-1">
      <h3 className="text-heading-md text-text-primary">{title}</h3>
      {description ? (
        <p className="text-body-sm text-text-muted">{description}</p>
      ) : null}
    </div>
  );
}

/** Profile + birthday blocks for the unified Account container. */
export function ProfileSection() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [birthday, setBirthday] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) {
      setBirthday("");
      return;
    }
    setBirthday(birthdayFromMetadata(user.unsafeMetadata));
  }, [user]);

  async function saveBirthday() {
    if (!user) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          birthday: birthday.trim(),
        },
      });
      setMessage("Birthday saved.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save birthday.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded) {
    return (
      <p className="text-body-sm text-text-muted">Loading profile…</p>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <p className="text-body-sm text-text-muted">
        Sign in to update your name, photo, password, and birthday.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col gap-space-8">
      <section className="flex w-full flex-col gap-space-4">
        <SectionTitle
          title="Profile"
          description="Update your name, profile picture, and password."
        />
        <div className="w-full min-w-0 overflow-x-auto">
          <UserProfile
            routing="hash"
            appearance={{
              variables: {
                colorPrimary: "var(--accent-primary)",
                colorBackground: "transparent",
                colorForeground: "var(--text-primary)",
                colorMutedForeground: "var(--text-muted)",
                colorNeutral: "var(--border-default)",
                colorInput: "var(--bg-base)",
                colorInputForeground: "var(--text-primary)",
                borderRadius: "0.5rem",
              },
              elements: {
                rootBox: "w-full! max-w-none!",
                cardBox:
                  "w-full! max-w-none! shadow-none! border-0! bg-transparent!",
                card: "w-full! max-w-none! shadow-none! border-0! bg-transparent!",
                scrollBox: "w-full! bg-transparent!",
                pageScrollBox: "w-full! p-0! bg-transparent!",
                navbar: "bg-bg-subtle rounded-md",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
              },
            }}
          />
        </div>
      </section>

      <section className="flex w-full flex-col gap-space-3 border-t border-border-subtle pt-space-6">
        <SectionTitle title="Birthday" />
        <div className="flex w-full flex-col gap-space-3 sm:flex-row sm:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-space-1">
            <span className="text-caption text-text-muted">Date of birth</span>
            <Input
              size="Desktop"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              aria-label="Birthday"
            />
          </label>
          <Button
            variant="Primary"
            size="md"
            disabled={saving}
            onClick={() => void saveBirthday()}
          >
            {saving ? "Saving…" : "Save birthday"}
          </Button>
        </div>
        {message ? (
          <p className="text-body-sm text-status-success">{message}</p>
        ) : null}
        {error ? (
          <p className="text-body-sm text-status-error" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    </div>
  );
}
