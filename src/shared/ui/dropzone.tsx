'use client';

import { type DragEvent, type ReactNode, useRef, useState } from 'react';

import { Loader2Icon, UploadCloudIcon } from './icons';
import { cn } from './utils/cn';

/**
 * The one file drop target for the whole product.
 *
 * Three flows used to hand-roll the same `role="button"` drag-and-drop surface —
 * onboarding, opportunity creation, and document analysis. They now share this.
 * The component is deliberately validation-agnostic: it collects files (from a
 * drop or the picker) and hands them to `onFiles`, and each caller keeps its own
 * rules — the onboarding and LOI flows reject oversized or unsupported files,
 * the analysis flow caps by size — so no validation behaviour changes.
 */
export function Dropzone({
  onFiles,
  accept,
  multiple = true,
  uploading = false,
  disabled = false,
  label,
  hint,
  className,
}: {
  /** Called with the chosen files, from either a drop or the file picker. */
  readonly onFiles: (files: File[]) => void;
  /** `accept` attribute for the native picker; drops are unfiltered as before. */
  readonly accept?: string;
  readonly multiple?: boolean;
  /** Swaps the icon for a spinner and the label for "Uploading…". */
  readonly uploading?: boolean;
  readonly disabled?: boolean;
  readonly label?: ReactNode;
  readonly hint?: ReactNode;
  readonly className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const isDisabled = disabled || uploading;

  const open = () => {
    if (!isDisabled) inputRef.current?.click();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (isDisabled) return;
    onFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={isDisabled || undefined}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      }}
      onDragOver={(event) => {
        if (isDisabled) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'focus-ring flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors',
        dragging
          ? 'border-primary/60 bg-primary/[0.06]'
          : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30',
        isDisabled && 'cursor-not-allowed opacity-80',
        className,
      )}
    >
      <span
        className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        aria-hidden="true"
      >
        {uploading ? (
          <Loader2Icon className="size-6 animate-spin" />
        ) : (
          <UploadCloudIcon className="size-6" />
        )}
      </span>
      <p className="text-sm font-medium">
        {uploading ? 'Uploading…' : (label ?? 'Drag files here, or click to browse')}
      </p>
      {hint !== undefined && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) onFiles(Array.from(event.target.files));
          event.target.value = '';
        }}
      />
    </div>
  );
}
