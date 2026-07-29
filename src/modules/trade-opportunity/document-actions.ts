'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import type { TenantContext } from '@/core/entities';
import { isFailure, isSuccess } from '@/core/result';
import { createServerContainer } from '@/server/container';
import { getSession } from '@/server/session';
import { routes } from '@/shared/config/routes';
import {
  type ActionState,
  errorState,
  fromAppError,
  successState,
} from '@/shared/lib/action-state';

import {
  type ExtractionField,
  type ExtractionResult,
  mergeExtractionIntoDraft,
} from './domain/extraction';
import { type DocumentKind, DOCUMENT_KINDS } from './domain/opportunity-document';
import { draftOf } from './domain/trade-opportunity';

/**
 * Document intelligence Server Actions.
 *
 * `extractDocument` reads an uploaded file with the configured AI model and
 * returns a structured, honest ExtractionResult (never fabricated). `applyExtraction`
 * merges the fields the user accepted into the opportunity. Extraction runs
 * in-memory — attaching the file for long-term storage is a separate concern
 * (the opportunity_documents table), so extraction works before that ships.
 */
const ACCEPTED = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);
const MAX_BYTES = 15 * 1024 * 1024;

async function requireWorkspace(): Promise<TenantContext> {
  const session = await getSession();
  if (session.status === 'unauthenticated') redirect(routes.signIn);
  if (session.status === 'needs-onboarding') redirect(routes.onboarding);
  return session.context;
}

export async function extractDocumentAction(
  _previousState: ActionState<ExtractionResult | undefined>,
  formData: FormData,
): Promise<ActionState<ExtractionResult | undefined>> {
  await requireWorkspace();

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return errorState('Choose a document to analyze.');
  }
  if (file.size > MAX_BYTES) {
    return errorState('Keep documents under 15 MB.');
  }
  if (!ACCEPTED.has(file.type)) {
    return errorState('Upload a PDF, image, or text document.');
  }

  const { documentExtractor } = await createServerContainer();
  const result = await documentExtractor.extract({
    bytes: await file.arrayBuffer(),
    mimeType: file.type,
    fileName: file.name,
  });

  if (isFailure(result)) return fromAppError(result.error);
  return successState(result.value);
}

export async function applyExtractionAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireWorkspace();

  const id = String(formData.get('opportunityId') ?? '');
  if (id.length === 0) return errorState('Missing opportunity.');

  let fields: ExtractionField[];
  try {
    const parsed: unknown = JSON.parse(String(formData.get('fields') ?? '[]'));
    fields = Array.isArray(parsed) ? (parsed as ExtractionField[]) : [];
  } catch {
    return errorState('Could not read the accepted fields.');
  }
  if (fields.length === 0) return errorState('Select at least one field to apply.');

  const { tradeOpportunities } = await createServerContainer();
  const found = await tradeOpportunities.findById(id);
  if (!isSuccess(found) || found.value === null) {
    return errorState('That opportunity no longer exists.');
  }

  const nextDraft = mergeExtractionIntoDraft(draftOf(found.value), fields);
  const updated = await tradeOpportunities.update({ id, draft: nextDraft });
  if (isFailure(updated)) return fromAppError(updated.error);

  revalidatePath(`${routes.opportunities}/${id}`);
  return successState(undefined);
}

// ---------------------------------------------------------------------------
// Document management — persistence, versioning, and timeline.
// ---------------------------------------------------------------------------

function safePath(
  organizationId: string,
  opportunityId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
  return `${organizationId}/${opportunityId}/${crypto.randomUUID()}-${safeName}`;
}

function parseKind(value: FormDataEntryValue | null): DocumentKind {
  return DOCUMENT_KINDS.includes(value as DocumentKind)
    ? (value as DocumentKind)
    : 'other';
}

export async function uploadOpportunityDocumentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireWorkspace();

  const opportunityId = String(formData.get('opportunityId') ?? '');
  if (opportunityId.length === 0) return errorState('Missing opportunity.');

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return errorState('Choose a document.');
  if (file.size > MAX_BYTES) return errorState('Keep documents under 15 MB.');

  const kind = parseKind(formData.get('kind'));
  const path = safePath(context.organization.id, opportunityId, file.name);

  const { opportunityDocuments, opportunityDocumentStorage, opportunityTimeline } =
    await createServerContainer();

  const uploaded = await opportunityDocumentStorage.upload({
    path,
    body: await file.arrayBuffer(),
    contentType: file.type || 'application/octet-stream',
  });
  if (isFailure(uploaded)) return fromAppError(uploaded.error);

  const recorded = await opportunityDocuments.record({
    organizationId: context.organization.id,
    opportunityId,
    userId: context.profile.id,
    kind,
    fileName: file.name,
    storagePath: path,
    mimeType: file.type || null,
    sizeBytes: file.size,
  });
  if (isFailure(recorded)) {
    // Metadata failed after the bytes landed — remove the orphan.
    await opportunityDocumentStorage.remove(path);
    return fromAppError(recorded.error);
  }

  await opportunityTimeline.record({
    organizationId: context.organization.id,
    opportunityId,
    userId: context.profile.id,
    kind: 'document_uploaded',
    title: `Uploaded ${file.name}`,
  });

  revalidatePath(`${routes.opportunities}/${opportunityId}`);
  return successState(undefined);
}

export async function renameOpportunityDocumentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireWorkspace();

  const id = String(formData.get('id') ?? '');
  const opportunityId = String(formData.get('opportunityId') ?? '');
  const fileName = String(formData.get('fileName') ?? '').trim();
  if (id.length === 0 || fileName.length === 0) return errorState('Enter a name.');
  if (fileName.length > 255) return errorState('That name is too long.');

  const { opportunityDocuments } = await createServerContainer();
  const renamed = await opportunityDocuments.rename({ id, fileName });
  if (isFailure(renamed)) return fromAppError(renamed.error);

  revalidatePath(`${routes.opportunities}/${opportunityId}`);
  return successState(undefined);
}

export async function replaceOpportunityDocumentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireWorkspace();

  const oldId = String(formData.get('id') ?? '');
  const opportunityId = String(formData.get('opportunityId') ?? '');
  const file = formData.get('file');
  if (oldId.length === 0 || opportunityId.length === 0)
    return errorState('Missing document.');
  if (!(file instanceof File) || file.size === 0)
    return errorState('Choose a replacement.');
  if (file.size > MAX_BYTES) return errorState('Keep documents under 15 MB.');

  const { opportunityDocuments, opportunityDocumentStorage, opportunityTimeline } =
    await createServerContainer();

  const existing = await opportunityDocuments.findById(oldId);
  if (!isSuccess(existing) || existing.value === null) {
    return errorState('That document no longer exists.');
  }

  const path = safePath(context.organization.id, opportunityId, file.name);
  const uploaded = await opportunityDocumentStorage.upload({
    path,
    body: await file.arrayBuffer(),
    contentType: file.type || 'application/octet-stream',
  });
  if (isFailure(uploaded)) return fromAppError(uploaded.error);

  const recorded = await opportunityDocuments.record({
    organizationId: context.organization.id,
    opportunityId,
    userId: context.profile.id,
    kind: existing.value.kind,
    fileName: file.name,
    storagePath: path,
    mimeType: file.type || null,
    sizeBytes: file.size,
    version: existing.value.version + 1,
    replacesId: oldId,
  });
  if (isFailure(recorded)) {
    await opportunityDocumentStorage.remove(path);
    return fromAppError(recorded.error);
  }

  // The old row stays for history; it just stops being the current version.
  await opportunityDocuments.supersede(oldId);
  await opportunityTimeline.record({
    organizationId: context.organization.id,
    opportunityId,
    userId: context.profile.id,
    kind: 'document_replaced',
    title: `Replaced with ${file.name}`,
    detail: `Version ${existing.value.version + 1}`,
  });

  revalidatePath(`${routes.opportunities}/${opportunityId}`);
  return successState(undefined);
}

export async function deleteOpportunityDocumentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireWorkspace();

  const id = String(formData.get('id') ?? '');
  const opportunityId = String(formData.get('opportunityId') ?? '');
  if (id.length === 0) return errorState('Missing document.');

  const { opportunityDocuments, opportunityDocumentStorage, opportunityTimeline } =
    await createServerContainer();

  const existing = await opportunityDocuments.findById(id);
  if (!isSuccess(existing) || existing.value === null) {
    return errorState('That document no longer exists.');
  }

  const removed = await opportunityDocuments.remove(id);
  if (isFailure(removed)) return fromAppError(removed.error);

  // Best-effort: the row is gone; a stray storage object is harmless.
  await opportunityDocumentStorage.remove(existing.value.storagePath);
  await opportunityTimeline.record({
    organizationId: context.organization.id,
    opportunityId,
    userId: context.profile.id,
    kind: 'document_removed',
    title: `Removed ${existing.value.fileName}`,
  });

  revalidatePath(`${routes.opportunities}/${opportunityId}`);
  return successState(undefined);
}

export async function opportunityDocumentUrlAction(
  _previousState: ActionState<string | undefined>,
  formData: FormData,
): Promise<ActionState<string | undefined>> {
  await requireWorkspace();

  const id = String(formData.get('id') ?? '');
  if (id.length === 0) return errorState('Missing document.');

  const { opportunityDocuments, opportunityDocumentStorage } =
    await createServerContainer();
  const doc = await opportunityDocuments.findById(id);
  if (!isSuccess(doc) || doc.value === null)
    return errorState('That document no longer exists.');

  const url = await opportunityDocumentStorage.createSignedUrl(
    doc.value.storagePath,
    120,
  );
  if (isFailure(url)) return fromAppError(url.error);
  return successState(url.value);
}
