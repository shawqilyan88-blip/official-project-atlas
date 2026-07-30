'use client';

import { useRouter } from 'next/navigation';
import {
  type DragEvent,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  applyExtractionAction,
  extractDocumentAction,
} from '@/modules/trade-opportunity/document-actions';
import type { ExtractionField } from '@/modules/trade-opportunity/domain/extraction';
import { idleState } from '@/shared/lib/action-state';
import { Alert, Button, cn } from '@/shared/ui';
import {
  CheckIcon,
  FileTextIcon,
  Loader2Icon,
  SparklesIcon,
  UploadCloudIcon,
  XIcon,
} from '@/shared/ui/icons';

/**
 * Document intelligence — upload a business document, let Atlas read it, review
 * and edit what it understood, and apply it to the opportunity.
 *
 * The pipeline stages are shown while the real extraction runs; they narrate
 * genuine work, they do not fake it. If no model is configured, or the format
 * isn't supported, the result says so plainly and the user continues manually —
 * nothing is ever invented.
 */
const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.txt,.csv';
const MAX_MB = 15;

const STAGES = [
  'Reading document',
  'Understanding products',
  'Detecting countries',
  'Extracting specifications',
  'Detecting quantities',
  'Understanding certifications',
  'Building trade opportunity',
] as const;

interface Row {
  readonly key: string;
  readonly label: string;
  readonly kind: 'text' | 'list';
  readonly appliesTo: ExtractionField['appliesTo'];
  readonly confidence: number;
  include: boolean;
  text: string;
}

export function DocumentIntelligence({
  opportunityId,
}: {
  readonly opportunityId: string;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [extractState, extractAction, extracting] = useActionState(
    extractDocumentAction,
    idleState,
  );
  const [applyState, applyAction, applying] = useActionState(
    applyExtractionAction,
    idleState,
  );

  const result = extractState.status === 'success' ? extractState.data : undefined;

  const choose = (picked: File | null) => {
    setLocalError(null);
    if (!picked) return;
    if (picked.size > MAX_MB * 1024 * 1024) {
      setLocalError(`Keep documents under ${MAX_MB} MB.`);
      return;
    }
    setFile(picked);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    choose(event.dataTransfer.files?.[0] ?? null);
  };

  const analyze = () => {
    if (!file) return;
    const fd = new FormData();
    fd.set('file', file);
    startTransition(() => extractAction(fd));
  };

  const reset = () => {
    setFile(null);
    setLocalError(null);
  };

  const apply = (accepted: ExtractionField[]) => {
    const fd = new FormData();
    fd.set('opportunityId', opportunityId);
    fd.set('fields', JSON.stringify(accepted));
    startTransition(() => applyAction(fd));
  };

  useEffect(() => {
    if (applyState.status === 'success') router.refresh();
  }, [applyState.status, router]);

  // --- Review (a successful extraction) ---
  if (result?.status === 'extracted' && !extracting) {
    return (
      <ReviewSummary
        key={`${file?.name ?? 'doc'}-${result.overallConfidence}-${result.fields.length}`}
        fields={result.fields}
        confidence={result.overallConfidence}
        missing={result.missing}
        fileName={file?.name ?? 'document'}
        applying={applying}
        applied={applyState.status === 'success'}
        error={applyState.status === 'error' ? applyState.message : null}
        onApply={apply}
        onReset={reset}
      />
    );
  }

  // --- Analyzing ---
  if (extracting) return <Pipeline fileName={file?.name ?? 'document'} />;

  // --- Honest non-extracted outcomes ---
  const honest =
    result && result.status !== 'extracted' ? (result.message ?? null) : null;

  return (
    <div className="space-y-4">
      {honest !== null && (
        <Alert
          tone={result?.status === 'failed' ? 'error' : 'info'}
          title="Not extracted"
        >
          {honest}
        </Alert>
      )}
      {(localError !== null || extractState.status === 'error') && (
        <Alert tone="error" title="Couldn’t analyze">
          {localError ?? (extractState.status === 'error' ? extractState.message : '')}
        </Alert>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) =>
          (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()
        }
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors',
          'focus-ring',
          dragging
            ? 'border-primary/60 bg-primary/[0.06]'
            : 'border-border/70 bg-card/40 hover:border-border',
        )}
      >
        <span
          className={cn(
            'mb-4 flex size-12 items-center justify-center rounded-2xl transition-transform',
            dragging
              ? 'scale-110 bg-primary text-primary-foreground'
              : 'bg-primary/10 text-primary',
          )}
          aria-hidden="true"
        >
          <UploadCloudIcon className="size-6" />
        </span>
        <p className="text-sm font-medium">
          Drop a business document, or <span className="text-primary">browse</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          LOI, RFQ, PO, spec, or catalog · PDF, image, or text · up to {MAX_MB} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => choose(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Selected file + analyze */}
      {file && (
        <div className="animate-rise flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <FileTextIcon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Remove file"
          >
            <XIcon className="size-4" aria-hidden="true" />
          </button>
          <Button type="button" size="sm" onClick={analyze}>
            <SparklesIcon aria-hidden="true" />
            Analyze with Atlas
          </Button>
        </div>
      )}
    </div>
  );
}

function Pipeline({ fileName }: { fileName: string }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    // Advance through stages while the real extraction runs; hold on the last
    // until the server responds and the parent swaps this out.
    const id = setInterval(
      () => setActive((i) => Math.min(i + 1, STAGES.length - 1)),
      650,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="relative flex size-9 items-center justify-center">
          <span
            aria-hidden="true"
            className="animate-orbit absolute inset-0 rounded-full border border-dashed border-primary/40"
          />
          <span className="animate-breathe flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <SparklesIcon className="size-4" aria-hidden="true" />
          </span>
        </span>
        <div>
          <p className="text-sm font-semibold">Atlas is reading {fileName}</p>
          <p className="text-xs text-muted-foreground">
            Extracting the trade opportunity…
          </p>
        </div>
      </div>
      <ol className="space-y-2.5" aria-live="polite">
        {STAGES.map((stage, index) => {
          const state = index < active ? 'done' : index === active ? 'active' : 'idle';
          return (
            <li key={stage} className="flex items-center gap-3">
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border',
                  state === 'done'
                    ? 'border-success/40 bg-success/15 text-success'
                    : state === 'active'
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border bg-muted/40 text-muted-foreground',
                )}
                aria-hidden="true"
              >
                {state === 'done' ? (
                  <CheckIcon className="size-3" />
                ) : state === 'active' ? (
                  <Loader2Icon className="size-3 animate-spin" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current opacity-40" />
                )}
              </span>
              <span
                className={cn(
                  'text-sm',
                  state === 'idle' ? 'text-muted-foreground/60' : 'text-foreground',
                )}
              >
                {stage}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ReviewSummary({
  fields,
  confidence,
  missing,
  fileName,
  applying,
  applied,
  error,
  onApply,
  onReset,
}: {
  fields: readonly ExtractionField[];
  confidence: number;
  missing: readonly string[];
  fileName: string;
  applying: boolean;
  applied: boolean;
  error: string | null;
  onApply: (accepted: ExtractionField[]) => void;
  onReset: () => void;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    fields.map((f) => ({
      key: f.key,
      label: f.label,
      kind: f.kind,
      appliesTo: f.appliesTo,
      confidence: f.confidence,
      include: true,
      text: Array.isArray(f.value) ? f.value.join(', ') : String(f.value),
    })),
  );
  const pct = Math.round(confidence * 100);

  const submit = () => {
    const accepted: ExtractionField[] = rows
      .filter((r) => r.include && r.text.trim().length > 0)
      .map((r) => ({
        key: r.key,
        label: r.label,
        kind: r.kind,
        appliesTo: r.appliesTo,
        confidence: r.confidence,
        value:
          r.kind === 'list'
            ? r.text
                .split(/[,;\n]/)
                .map((s) => s.trim())
                .filter(Boolean)
            : r.text.trim(),
      }));
    onApply(accepted);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <SparklesIcon className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Here’s what Atlas understood</h2>
              <p className="text-xs text-muted-foreground">
                From {fileName}. Review and edit before applying — nothing is saved until
                you do.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Confidence <span className="text-foreground tabular-nums">{pct}%</span>
          </span>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Atlas didn’t find structured fields in this document. You can still complete
            the brief manually.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {rows.map((row, index) => (
              <li
                key={row.key}
                className={cn(
                  'rounded-xl border p-3 transition-colors',
                  row.include
                    ? 'border-border/70 bg-background/40'
                    : 'border-border/50 opacity-60',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {row.label}
                    </span>
                    <ConfidenceDot confidence={row.confidence} />
                  </div>
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={row.include}
                      onChange={(e) =>
                        setRows((rs) =>
                          rs.map((r, i) =>
                            i === index ? { ...r, include: e.target.checked } : r,
                          ),
                        )
                      }
                      className="size-3.5 accent-[var(--primary)]"
                    />
                    Include
                  </label>
                </div>
                <input
                  value={row.text}
                  onChange={(e) =>
                    setRows((rs) =>
                      rs.map((r, i) =>
                        i === index ? { ...r, text: e.target.value } : r,
                      ),
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/15"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {missing.length > 0 && (
        <section className="rounded-2xl border border-border/70 bg-card p-5">
          <p className="mb-2 text-sm font-medium">Atlas couldn’t determine</p>
          <p className="mb-2.5 text-xs text-muted-foreground">
            These weren’t in the document. Add them in the brief to sharpen the search —
            you don’t need to re-enter anything else.
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {missing.map((m) => (
              <li
                key={m}
                className="rounded-full border border-warning/30 bg-warning/[0.06] px-2.5 py-0.5 text-xs text-foreground/90"
              >
                {m}
              </li>
            ))}
          </ul>
        </section>
      )}

      {error !== null && (
        <Alert tone="error" title="Couldn’t apply">
          {error}
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onReset} disabled={applying}>
          Analyze another
        </Button>
        {applied ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckIcon className="size-4" aria-hidden="true" />
            Applied to the opportunity
          </span>
        ) : (
          <Button
            type="button"
            onClick={submit}
            loading={applying}
            loadingLabel="Applying…"
          >
            <CheckIcon aria-hidden="true" />
            Apply to opportunity
          </Button>
        )}
      </div>
    </div>
  );
}

function ConfidenceDot({ confidence }: { confidence: number }) {
  const tone =
    confidence >= 0.8 ? 'bg-success' : confidence >= 0.5 ? 'bg-primary' : 'bg-warning';
  return (
    <span
      className="inline-flex items-center gap-1"
      title={`Confidence ${Math.round(confidence * 100)}%`}
    >
      <span className={cn('size-1.5 rounded-full', tone)} aria-hidden="true" />
      <span className="text-[0.625rem] text-muted-foreground tabular-nums">
        {Math.round(confidence * 100)}%
      </span>
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
