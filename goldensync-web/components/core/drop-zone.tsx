"use client";

/**
 * DropZone — PDF pick area (Figma `28:127`, UI-035).
 * Flow: Add Subject PDF — Idle | Hover | Active | Selected | Error.
 * Q-002: react-dropzone for drag/drop + file picker. Parsing stays server-side.
 */

import { CloudUpload } from "lucide-react";
import * as React from "react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/core/button";
import { cn } from "@/lib/utils";

export type DropZoneState =
  | "Idle"
  | "Hover"
  | "Active"
  | "Selected"
  | "Error";

export interface DropZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: DropZoneState;
  fileName?: string;
  /** Fired with the chosen File (PDF). Parent owns Proto pdfOutcome. */
  onFile?: (file: File) => void;
  onSelectFile?: () => void;
  onRemoveFile?: () => void;
  disabled?: boolean;
}

/** PDF drop target; Sync Syllabus enablement is owned by the upload machine. */
export function DropZone({
  className,
  state = "Idle",
  fileName,
  onFile,
  onSelectFile,
  onRemoveFile,
  disabled = false,
  ...props
}: DropZoneProps) {
  const isError = state === "Error";
  const isSelected = state === "Selected";

  const onDrop = React.useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      onFile?.(file);
      onSelectFile?.();
    },
    [onFile, onSelectFile],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxFiles: 1,
      multiple: false,
      disabled: disabled || isSelected,
      noClick: true,
      noKeyboard: true,
    });

  const visual: DropZoneState = isError
    ? "Error"
    : isSelected
      ? "Selected"
      : isDragReject
        ? "Error"
        : isDragActive
          ? "Active"
          : state === "Hover"
            ? "Hover"
            : "Idle";

  const rootProps = getRootProps();

  return (
    <div
      {...props}
      {...rootProps}
      data-slot="gs-drop-zone"
      data-state={visual}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-space-3 rounded-lg border border-dashed px-space-6 py-space-8 text-center",
        "bg-bg-subtle transition-[border-color,background-color] duration-150 ease-out",
        visual === "Error"
          ? "border-status-error shadow-[0_0_0_3px_var(--error-ring-glow)]"
          : visual === "Active"
            ? "border-accent-primary border-solid"
            : visual === "Hover" || visual === "Selected"
              ? "border-border-strong"
              : "border-border-default",
        className,
      )}
    >
      <input {...getInputProps()} />
      <CloudUpload
        className={cn(
          "size-8",
          visual === "Error" ? "text-status-error" : "text-text-muted",
        )}
        aria-hidden
      />
      <div className="flex flex-col gap-space-1">
        <p className="text-body-sm font-medium text-text-primary">
          {visual === "Selected" && fileName
            ? fileName
            : visual === "Error"
              ? "Could not use that file"
              : isDragActive
                ? "Drop PDF to upload"
                : "Drop a PDF syllabus here"}
        </p>
        <p className="text-caption text-text-muted">
          {visual === "Selected"
            ? "Ready to sync"
            : "PDF only · max size per plan limits"}
        </p>
      </div>
      {visual === "Selected" ? (
        <Button variant="Ghost" size="sm" onClick={onRemoveFile}>
          Remove file
        </Button>
      ) : (
        <Button variant="Secondary" size="md" onClick={() => open()}>
          Select file
        </Button>
      )}
    </div>
  );
}
