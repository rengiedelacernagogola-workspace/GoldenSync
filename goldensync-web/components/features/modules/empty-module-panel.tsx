"use client";

// WHAT: Placeholder when a subject module is missing from the syllabus.
// SCREEN: EmptyState with "Edit subject" action routing to /subjects/:id/edit.
// HOW: Used with ?empty=1 query for design QA via Demo Panel.
// EDIT: Figma EmptyModule UI-093 — keep copy aligned with appendix empty module.

/**
 * Empty module panel — Figma EmptyModule (`134:1287`+, UI-093).
 * FLOW: ?empty=1 (Demo Panel) → EmptyState → Edit subject.
 */

import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/core";

// WHAT: Thin wrapper — passes subjectId into Edit subject navigation.
export function EmptyModulePanel({ subjectId }: { subjectId: string }) {
  const router = useRouter();

  return (
    <EmptyState
      icon={<FileText strokeWidth={1.25} />}
      title="Not in this syllabus."
      body="Edit subject to add it."
      actionLabel="Edit subject"
      onAction={() => router.push(`/subjects/${subjectId}/edit`)}
      className="min-h-[320px]"
    />
  );
}
