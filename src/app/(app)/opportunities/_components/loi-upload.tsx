'use client';

import { type DragEvent, useRef, useState } from 'react';

import {
  type UploadedDocument,
  uploadTradeDocumentAction,
} from '@/modules/trade-profile/actions';
import {
  ACCEPTED_DOCUMENT_EXTENSIONS,
  MAX_DOCUMENT_SIZE_LABEL,
  rejectDocument,
} from '@/modules/trade-profile/domain/schemas';
import { idleState } from '@/shared/lib/action-state';
import { Alert, Button, cn } from '@/shared/ui';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  FileTextIcon,
  Loader2Icon,
  UploadCloudIcon,
} from '@/shared/ui/icons';

/**
 * Upload an LOI to seed a Trade Opportunity.
 *
 * A real feature framed as the business moment it is: dropping an important
 * document, not filling a field. The file is validated, stored in Supabase
 * Storage, and recorded — with an honest "Pending AI analysis" badge, because
 * extraction is not live yet. The user then continues to the brief, so the
 * opportunity gets built now and the document informs it once analysis ships.
 */
const SUPPORTED = [
  'Letter of Intent',
  'Purchase order',
  'RFQ',
  'Specification',
  'Quotation',
  'Company profile',
];

export function LoiUpload({
  documents,
  onUploaded,
  onContinue,
  onBack,
}: {
  readonly documents: readonly UploadedDocument[];
  readonly onUploaded: (document: UploadedDocument) => void;
  readonly onContinue: () => void;
  readonly onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const accept = async (files: readonly File[]) => {
    setError(null);
    setUploading(true);
    try {
      for (const file of files) {
        const rejection = rejectDocument({ type: file.type, size: file.size });
        if (rejection) {
          setError(rejection.message);
          continue;
        }
        const formData = new FormData();
        formData.set('file', file);
        const result = await uploadTradeDocumentAction(idleState, formData);
        if (result.status === 'success' && result.data) {
          onUploaded(result.data);
        } else if (result.status === 'error') {
          setError(result.message);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void accept(Array.from(event.dataTransfer.files));
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Upload your LOI</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add the Letter of Intent or brief for this opportunity. Atlas stores it securely
          and will extract the details automatically once analysis is live.
        </p>
      </div>

      {error !== null && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          dragging
            ? 'border-primary/60 bg-primary/[0.06]'
            : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30',
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
          {uploading ? 'Uploading…' : 'Drag your document here, or click to browse'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, Word, Excel, images, or text · up to {MAX_DOCUMENT_SIZE_LABEL}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_DOCUMENT_EXTENSIONS}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) void accept(Array.from(event.target.files));
            event.target.value = '';
          }}
        />
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Supported documents">
        {SUPPORTED.map((item) => (
          <li
            key={item}
            className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[0.6875rem] text-muted-foreground"
          >
            {item}
          </li>
        ))}
      </ul>

      {documents.length > 0 && (
        <ul className="mt-5 space-y-2">
          {documents.map((document) => (
            <li
              key={document.id}
              className="animate-rise flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3.5 py-2.5"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground"
                aria-hidden="true"
              >
                <FileTextIcon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{document.fileName}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[0.6875rem] font-medium text-warning">
                <ClockIcon className="size-3" aria-hidden="true" />
                Pending AI analysis
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack} disabled={uploading}>
          <ArrowLeftIcon aria-hidden="true" />
          Back
        </Button>
        <Button type="button" onClick={onContinue} disabled={uploading}>
          Continue to brief
          <ArrowRightIcon aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
