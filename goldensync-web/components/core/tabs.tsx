"use client";

// WHAT: Two-tab switcher — Upload PDF vs Enter manually for new subject.
// SCREEN: Add Subject modal header tablist.
// HOW: Controlled selected + onSelectedChange; uses Tab children for a11y roles.
// KEEP: Stays enabled during PDF processing (DEC-053).
// EDIT: Tab labels/icons here — routing between modes is parent state.
// RISK: Low

/**
 * Tabs — Add Subject mode switch (Figma `22:490`, UI-023).
 * Flow: Upload PDF | Enter manually. Stays available during Processing (DEC-053).
 * Edit labels/icons here; step machine lives in features/add-subject later.
 */

import { CloudUpload, FileText } from "lucide-react";
import * as React from "react";

import { Tab } from "@/components/core/tab";
import { cn } from "@/lib/utils";

export type AddSubjectTab = "Upload" | "Manual";

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: AddSubjectTab;
  onSelectedChange?: (value: AddSubjectTab) => void;
}

/** Tablist for Add Subject; parent owns selected tab. */
export function Tabs({
  className,
  selected = "Upload",
  onSelectedChange,
  ...props
}: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Add subject method"
      data-slot="gs-tabs"
      className={cn(
        "relative flex h-11 w-full items-start gap-space-1 border-b border-border-subtle",
        className,
      )}
      {...props}
    >
      <Tab
        label="Upload PDF"
        icon={<CloudUpload aria-hidden />}
        selected={selected === "Upload"}
        onClick={() => onSelectedChange?.("Upload")}
      />
      <Tab
        label="Enter manually"
        icon={<FileText aria-hidden />}
        selected={selected === "Manual"}
        onClick={() => onSelectedChange?.("Manual")}
      />
    </div>
  );
}
