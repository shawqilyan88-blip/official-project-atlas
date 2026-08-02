'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useRef, useState } from 'react';

import {
  deleteOpportunityDocumentAction,
  opportunityDocumentUrlAction,
  renameOpportunityDocumentAction,
  replaceOpportunityDocumentAction,
  uploadOpportunityDocumentAction,
} from '@/modules/trade-opportunity/document-actions';
import {
  DOCUMENT_KIND_LABEL,
  DOCUMENT_KINDS,
  type DocumentKind,
  groupDocumentVersions,
  isPreviewable,
  type OpportunityDocument,
} from '@/modules/trade-opportunity/domain/opportunity-document';
import { idleState } from '@/shared/lib/action-state';
import {
  Alert,
  Button,
  cn,
  ConfirmDialog,
  Dialog,
  DialogClose,
  DialogContent,
} from '@/shared/ui';
import {
  CheckIcon,
  ClockIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  Loader2Icon,
  PencilIcon,
  RefreshCwIcon,
  Trash2Icon,
  UploadCloudIcon,
  XIcon,
} from '@/shared/ui/icons';

/**
 * Document management for an opportunity: upload, rename, replace (versioned),
 * download, preview, and delete — every action a real server action against
 * Supabase Storage + the opportunity_documents table, with a timeline entry.
 */
export function DocumentList({
  opportunityId,
  documents,
}: {
  readonly opportunityId: string;
  readonly documents: readonly OpportunityDocument[];
}) {
  const router = useRouter();
  const { current, historyOf } = groupDocumentVersions(documents);

  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [kind, setKind] = useState<DocumentKind>('other');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; mime: string | null } | null>(
    null,
  );
  // Delete confirmation target, and the ids being optimistically removed so the
  // row disappears the moment you confirm rather than after the round-trip.
  const [pendingDelete, setPendingDelete] = useState<OpportunityDocument | null>(null);
  const [removingIds, setRemovingIds] = useState<readonly string[]>([]);

  const uploadRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceTargetId = useRef<string | null>(null);

  const refresh = () => router.refresh();

  const doUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.set('opportunityId', opportunityId);
    fd.set('kind', kind);
    fd.set('file', file);
    const res = await uploadOpportunityDocumentAction(idleState, fd);
    setUploading(false);
    if (res.status === 'error') setError(res.message);
    else refresh();
  };

  const doRename = async (id: string) => {
    if (renameValue.trim().length === 0) return;
    setBusy(id);
    const fd = new FormData();
    fd.set('id', id);
    fd.set('opportunityId', opportunityId);
    fd.set('fileName', renameValue.trim());
    const res = await renameOpportunityDocumentAction(idleState, fd);
    setBusy(null);
    setRenaming(null);
    if (res.status === 'error') setError(res.message);
    else refresh();
  };

  const doReplace = async (id: string, file: File) => {
    setBusy(id);
    setError(null);
    const fd = new FormData();
    fd.set('id', id);
    fd.set('opportunityId', opportunityId);
    fd.set('file', file);
    const res = await replaceOpportunityDocumentAction(idleState, fd);
    setBusy(null);
    if (res.status === 'error') setError(res.message);
    else refresh();
  };

  const doDelete = async (id: string) => {
    setError(null);
    // Optimistic: hide the row immediately; restore it if the server refuses.
    setRemovingIds((ids) => [...ids, id]);
    const fd = new FormData();
    fd.set('id', id);
    fd.set('opportunityId', opportunityId);
    const res = await deleteOpportunityDocumentAction(idleState, fd);
    if (res.status === 'error') {
      setRemovingIds((ids) => ids.filter((x) => x !== id));
      setError(res.message);
    } else {
      refresh();
    }
  };

  const openDoc = async (doc: OpportunityDocument, mode: 'download' | 'preview') => {
    setBusy(doc.id);
    const fd = new FormData();
    fd.set('id', doc.id);
    const res = await opportunityDocumentUrlAction(idleState, fd);
    setBusy(null);
    if (res.status !== 'success' || res.data === undefined) {
      setError(res.status === 'error' ? res.message : 'Could not open the document.');
      return;
    }
    if (mode === 'preview') setPreview({ url: res.data, mime: doc.mimeType });
    else window.open(res.data, '_blank', 'noopener');
  };

  // Hide rows being optimistically deleted until the server catches up.
  const visible = current.filter((doc) => !removingIds.includes(doc.id));

  return (
    <div className="space-y-4">
      {error !== null && (
        <Alert tone="error" title="That didn’t go through">
          {error}
        </Alert>
      )}

      {/* Upload */}
      <div className="rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as DocumentKind)}
            className="rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/15"
            aria-label="Document type"
          >
            {DOCUMENT_KINDS.map((k) => (
              <option key={k} value={k}>
                {DOCUMENT_KIND_LABEL[k]}
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            onClick={() => uploadRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            ) : (
              <UploadCloudIcon aria-hidden="true" />
            )}
            {uploading ? 'Uploading…' : 'Upload document'}
          </Button>
          <input
            ref={uploadRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) void doUpload(f);
            }}
          />
        </div>
        {uploading && (
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <div className="animate-progress-indeterminate h-full w-1/3 rounded-full bg-primary" />
          </div>
        )}
      </div>

      {/* Hidden replace input, targeted per-row */}
      <input
        ref={replaceRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          const id = replaceTargetId.current;
          e.target.value = '';
          if (f && id) void doReplace(id, f);
        }}
      />

      {/* Documents */}
      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
          No documents attached yet. Upload an LOI, RFQ, PO, spec, or catalog above.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {visible.map((doc) => {
            const history = historyOf(doc.id);
            const isBusy = busy === doc.id;
            return (
              <li
                key={doc.id}
                className="animate-rise rounded-xl border border-border/70 bg-card p-3.5"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    aria-hidden="true"
                  >
                    <FileTextIcon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {renaming === doc.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') void doRename(doc.id);
                            if (e.key === 'Escape') setRenaming(null);
                          }}
                          className="w-full rounded-lg border border-input bg-background px-2 py-1 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/15"
                        />
                        <button
                          type="button"
                          onClick={() => void doRename(doc.id)}
                          className="text-success"
                          aria-label="Save name"
                        >
                          <CheckIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenaming(null)}
                          className="text-muted-foreground"
                          aria-label="Cancel rename"
                        >
                          <XIcon className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="truncate text-sm font-medium">{doc.fileName}</p>
                    )}
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{DOCUMENT_KIND_LABEL[doc.kind]}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatBytes(doc.sizeBytes)}</span>
                      {doc.version > 1 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="rounded-full bg-muted px-1.5 font-medium">
                            v{doc.version}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    {isBusy && (
                      <Loader2Icon
                        className="mr-1 size-4 animate-spin text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    {isPreviewable(doc.mimeType) && (
                      <IconBtn
                        label="Preview"
                        onClick={() => void openDoc(doc, 'preview')}
                        disabled={isBusy}
                      >
                        <EyeIcon className="size-4" />
                      </IconBtn>
                    )}
                    <IconBtn
                      label="Download"
                      onClick={() => void openDoc(doc, 'download')}
                      disabled={isBusy}
                    >
                      <DownloadIcon className="size-4" />
                    </IconBtn>
                    <IconBtn
                      label="Rename"
                      onClick={() => {
                        setRenaming(doc.id);
                        setRenameValue(doc.fileName);
                      }}
                      disabled={isBusy}
                    >
                      <PencilIcon className="size-4" />
                    </IconBtn>
                    <IconBtn
                      label="Replace"
                      onClick={() => {
                        replaceTargetId.current = doc.id;
                        replaceRef.current?.click();
                      }}
                      disabled={isBusy}
                    >
                      <RefreshCwIcon className="size-4" />
                    </IconBtn>
                    <IconBtn
                      label="Delete"
                      onClick={() => setPendingDelete(doc)}
                      disabled={isBusy}
                      danger
                    >
                      <Trash2Icon className="size-4" />
                    </IconBtn>
                  </div>
                </div>

                {history.length > 0 && (
                  <div className="mt-2.5 border-t border-border/50 pt-2.5">
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ClockIcon className="size-3.5" aria-hidden="true" />
                      {history.length} earlier version{history.length > 1 ? 's' : ''}
                    </button>
                    {expanded === doc.id && (
                      <ul className="mt-2 space-y-1.5">
                        {history.map((old) => (
                          <li
                            key={old.id}
                            className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5"
                          >
                            <span className="min-w-0 truncate text-xs text-muted-foreground">
                              v{old.version} · {old.fileName}
                            </span>
                            <button
                              type="button"
                              onClick={() => void openDoc(old, 'download')}
                              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                              aria-label={`Download version ${old.version}`}
                            >
                              <DownloadIcon className="size-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {preview !== null && (
        <PreviewModal preview={preview} onClose={() => setPreview(null)} />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={pendingDelete ? `Delete ${pendingDelete.fileName}?` : 'Delete document?'}
        description="This permanently removes the document and its version history. This cannot be undone."
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={() => {
          const target = pendingDelete;
          setPendingDelete(null);
          if (target) void doDelete(target.id);
        }}
      />
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'focus-ring flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors',
        'hover:bg-muted hover:text-foreground disabled:opacity-40',
        danger && 'hover:bg-destructive/10 hover:text-destructive',
      )}
    >
      {children}
    </button>
  );
}

function PreviewModal({
  preview,
  onClose,
}: {
  preview: { url: string; mime: string | null };
  onClose: () => void;
}) {
  return (
    // Radix Dialog supplies what the hand-rolled version could not: Escape to
    // close, a focus trap, and focus returned to the trigger on close.
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        title="Document preview"
        showClose={false}
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
          <span className="text-sm font-medium">Preview</span>
          <DialogClose
            className="focus-ring flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close preview"
          >
            <XIcon className="size-4" aria-hidden="true" />
          </DialogClose>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-muted/20">
          {preview.mime?.startsWith('image/') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.url}
              alt="Document preview"
              className="mx-auto max-h-full"
            />
          ) : (
            <iframe
              src={preview.url}
              title="Document preview"
              className="h-[70vh] w-full"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatBytes(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
