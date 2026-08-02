'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useActionState, useEffect, useState } from 'react';

import {
  applyExtractionAction,
  extractDocumentAction,
} from '@/modules/trade-opportunity/document-actions';
import type { ExtractionField } from '@/modules/trade-opportunity/domain/extraction';
import { routes } from '@/shared/config/routes';
import { idleState } from '@/shared/lib/action-state';
import { Alert, Button, ConfirmDialog, Dropzone, cn } from '@/shared/ui';
import {
  CheckIcon,
  FileTextIcon,
  PencilIcon,
  SparklesIcon,
  XIcon,
} from '@/shared/ui/icons';

/**
 * Document intelligence — upload a business document, let Atlas read it, review
 * and edit what it understood, and apply it to the opportunity.
 *
 * While the real extraction runs, Atlas shows an honest waiting state — an
 * expectation, then a still-working message — never fabricated stages or
 * progress (D.3). If no model is configured, or the format isn't supported, the
 * result says so plainly and the user continues manually — nothing is invented.
 */
const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.txt,.csv';
const MAX_MB = 15;

interface Row {
  readonly key: string;
  readonly label: string;
  readonly kind: 'text' | 'list';
  readonly appliesTo: ExtractionField['appliesTo'];
  readonly confidence: number;
  include: boolean;
  text: string;
  /** Set once the user has confirmed the value — the "Confirmed by you" state. */
  reviewed: boolean;
}

/**
 * Certainty bands (D.2). Atlas's self-reported per-field confidence is never
 * shown as a precise number; it is translated — conservatively — into one of
 * three plain bands, each mapped to a single action. An unknown or low value
 * reads "Needs review", never a fabricated middle number.
 */
type Band = 'clear' | 'likely' | 'review';

function bandOf(confidence: number): Band {
  if (confidence >= 0.8) return 'clear';
  if (confidence >= 0.6) return 'likely';
  return 'review';
}

const BAND_LABEL: Record<Band, string> = {
  clear: 'Clearly stated',
  likely: 'Likely',
  review: 'Needs review',
};

export function DocumentIntelligence({
  opportunityId,
}: {
  readonly opportunityId: string;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

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
        opportunityId={opportunityId}
        fields={result.fields}
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

      {/* Pick a document to analyze (this stores nothing until you apply). */}
      <Dropzone
        onFiles={(files) => choose(files[0] ?? null)}
        accept={ACCEPT}
        multiple={false}
        label={
          <>
            Drop a business document, or <span className="text-primary">browse</span>
          </>
        }
        hint={`LOI, RFQ, PO, spec, or catalog · PDF, image, or text · up to ${MAX_MB} MB`}
      />

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
  // Honest waiting (D.3 PAT-WA): set an expectation, then move to a still-working
  // message once the wait outlasts it — the message changes only because real
  // time has passed. The orb is genuine work-motion (this IS running); there are
  // no fabricated steps, checkmarks, or percentages.
  const [longWait, setLongWait] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLongWait(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="relative flex size-9 items-center justify-center">
          <span
            aria-hidden="true"
            className="animate-orbit absolute inset-0 rounded-full border border-dashed border-primary/40"
          />
          <span className="animate-breathe flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <SparklesIcon className="size-4" aria-hidden="true" />
          </span>
        </span>
        <div aria-live="polite">
          <p className="text-sm font-semibold">Atlas is reading {fileName}</p>
          <p className="text-xs text-muted-foreground">
            {longWait
              ? 'Still reading — larger files take longer.'
              : 'Usually a few seconds. I’ll show you what I find to review.'}
          </p>
        </div>
      </div>
    </section>
  );
}

function ReviewSummary({
  opportunityId,
  fields,
  missing,
  fileName,
  applying,
  applied,
  error,
  onApply,
  onReset,
}: {
  opportunityId: string;
  fields: readonly ExtractionField[];
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
      reviewed: false,
    })),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [appliedCount, setAppliedCount] = useState(0);

  // Surface the weakest link, not an average (D.2 CA-5): how many fields still
  // need a look. The apply gate (D.2 §8) only counts ones being applied.
  const needsReview = rows.filter(
    (r) => !r.reviewed && bandOf(r.confidence) === 'review',
  ).length;
  const applyNeedsReview = rows.filter(
    (r) => r.include && !r.reviewed && bandOf(r.confidence) === 'review',
  ).length;

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
    setAppliedCount(accepted.length);
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
          {rows.length > 0 && (
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
                needsReview > 0
                  ? 'border-warning/40 bg-warning/[0.08] text-warning'
                  : 'border-success/30 bg-success/10 text-success',
              )}
            >
              {needsReview > 0
                ? `${needsReview} field${needsReview > 1 ? 's' : ''} need review`
                : 'Ready to apply'}
            </span>
          )}
        </div>

        {rows.length === 0 ? (
          <div>
            <p className="text-sm text-muted-foreground">
              Atlas didn’t find structured fields in this document. You can still complete
              the brief manually.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={`${routes.opportunities}/${opportunityId}/edit`}>
                <PencilIcon aria-hidden="true" />
                Complete the brief
              </Link>
            </Button>
          </div>
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
                    <BandLabel
                      band={bandOf(row.confidence)}
                      reviewed={row.reviewed}
                      onReview={() =>
                        setRows((rs) =>
                          rs.map((r, i) => (i === index ? { ...r, reviewed: true } : r)),
                        )
                      }
                    />
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
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={`${routes.opportunities}/${opportunityId}/edit`}>
              <PencilIcon aria-hidden="true" />
              Complete the brief
            </Link>
          </Button>
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
            Applied {appliedCount} {appliedCount === 1 ? 'detail' : 'details'} to your
            brief
          </span>
        ) : (
          <Button
            type="button"
            onClick={() => (applyNeedsReview > 0 ? setConfirmOpen(true) : submit())}
            loading={applying}
            loadingLabel="Applying…"
          >
            <CheckIcon aria-hidden="true" />
            Apply to opportunity
          </Button>
        )}
      </div>

      {/* Applying still-unverified fields to the brief asks for a look first
          (D.2 §8 review trigger). It is a prompt, not a wall — you can proceed. */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`${applyNeedsReview} field${applyNeedsReview > 1 ? 's' : ''} still need review`}
        description="Some values Atlas couldn't verify are included. Review them first, or apply anyway — you can always edit the brief afterwards."
        confirmLabel="Apply anyway"
        cancelLabel="Keep reviewing"
        onConfirm={() => {
          setConfirmOpen(false);
          submit();
        }}
      />
    </div>
  );
}

function BandLabel({
  band,
  reviewed,
  onReview,
}: {
  band: Band;
  reviewed: boolean;
  onReview: () => void;
}) {
  if (reviewed) {
    return (
      <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-success">
        <CheckIcon className="size-3" aria-hidden="true" />
        Confirmed by you
      </span>
    );
  }
  // Verbal-first, and "Needs review" is the loudest state (D.2 CT-4/AX).
  const tone =
    band === 'review'
      ? 'border-warning/40 bg-warning/[0.1] text-warning'
      : band === 'likely'
        ? 'border-border/70 bg-muted/50 text-muted-foreground'
        : 'border-success/30 bg-success/10 text-success';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          'rounded-full border px-1.5 py-0.5 text-[0.625rem] font-medium',
          tone,
        )}
      >
        {BAND_LABEL[band]}
      </span>
      {band !== 'clear' && (
        <button
          type="button"
          onClick={onReview}
          className="focus-ring rounded text-[0.625rem] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Mark reviewed
        </button>
      )}
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
