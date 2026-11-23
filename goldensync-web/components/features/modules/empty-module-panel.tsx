"use client";

/**
 * Empty module panel — Figma EmptyModule (`134:1287`+, UI-093).
 * FLOW: ?empty=1 (Demo Panel) → EmptyState → Edit subject.
 */

import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/core";

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
