'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import type { TenantContext } from '@/core/entities';
import { isFailure } from '@/core/result';
import { createServerContainer } from '@/server/container';
import { getSession } from '@/server/session';
import { routes } from '@/shared/config/routes';
import {
  type ActionState,
  errorState,
  fromAppError,
  successState,
  validationErrorState,
} from '@/shared/lib/action-state';

import { rejectDocument, tradeProfileInputSchema } from './domain/schemas';
import type { DocumentStatus, TradeProfileDraft } from './domain/trade-profile';

/**
 * Trade Profile Server Actions.
 *
 * Each re-establishes the caller and their workspace independently — a Server
 * Action is a public endpoint, reachable out of order and without the page that
 * normally precedes it. A caller without a workspace is sent to create one
 * first, which is the only correct place a Trade Profile can be attached.
 */
async function requireWorkspace(): Promise<TenantContext> {
  const session = await getSession();
  if (session.status === 'unauthenticated') redirect(routes.signIn);
  if (session.status === 'needs-onboarding') redirect(routes.onboarding);
  return session.context;
}

export async function saveTradeProfileAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireWorkspace();

  const raw = formData.get('payload');
  let payload: unknown;
  try {
    payload = JSON.parse(typeof raw === 'string' ? raw : '{}');
  } catch {
    return errorState('We could not read your details. Please try again.');
  }

  const parsed = tradeProfileInputSchema.safeParse(payload);
  if (!parsed.success) return validationErrorState(parsed.error);

  const draft: TradeProfileDraft = {
    products: parsed.data.products,
    industry: parsed.data.industry ?? null,
    roles: parsed.data.roles,
    businessTypes: parsed.data.businessTypes,
    companySize: parsed.data.companySize ?? null,
    lookingFor: parsed.data.lookingFor ?? null,
    countries: parsed.data.countries,
    productionCapacity: parsed.data.productionCapacity ?? null,
    moq: parsed.data.moq ?? null,
    certifications: parsed.data.certifications,
    languages: parsed.data.languages,
    incoterms: parsed.data.incoterms,
    paymentTerms: parsed.data.paymentTerms,
    currencies: parsed.data.currencies,
    website: parsed.data.website ?? null,
    description: parsed.data.description ?? null,
  };

  const { tradeProfile } = await createServerContainer();
  const result = await tradeProfile.save({
    organizationId: context.organization.id,
    userId: context.profile.id,
    draft,
  });

  if (isFailure(result)) return fromAppError(result.error);

  // Completing the profile flips the dashboard checklist and briefing; mark the
  // dashboard stale so the client's post-animation route lands on fresh state.
  revalidatePath(routes.dashboard);

  // The client plays the "building your profile" sequence and then routes to
  // the dashboard, so this returns success rather than redirecting.
  return successState(undefined);
}

export interface UploadedDocument {
  readonly id: string;
  readonly fileName: string;
  readonly sizeBytes: number | null;
  readonly status: DocumentStatus;
}

export async function uploadTradeDocumentAction(
  _previousState: ActionState<UploadedDocument | undefined>,
  formData: FormData,
): Promise<ActionState<UploadedDocument | undefined>> {
  const context = await requireWorkspace();

  const file = formData.get('file');
  if (!(file instanceof File)) return errorState('Choose a file to upload.');

  const rejection = rejectDocument({ type: file.type, size: file.size });
  if (rejection) return errorState(rejection.message);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
  const path = `${context.organization.id}/${crypto.randomUUID()}-${safeName}`;
  const body = await file.arrayBuffer();

  const { tradeProfile, tradeDocuments } = await createServerContainer();

  const uploaded = await tradeDocuments.upload({
    path,
    body,
    contentType: file.type || 'application/octet-stream',
  });
  if (isFailure(uploaded)) return fromAppError(uploaded.error);

  const recorded = await tradeProfile.recordDocument({
    organizationId: context.organization.id,
    userId: context.profile.id,
    fileName: file.name,
    storagePath: path,
    mimeType: file.type || null,
    sizeBytes: file.size,
  });

  if (isFailure(recorded)) {
    // The bytes landed but the metadata did not; remove the orphan so a retry
    // does not leave the bucket littered with unreferenced files.
    await tradeDocuments.remove(path);
    return fromAppError(recorded.error);
  }

  return successState({
    id: recorded.value.id,
    fileName: recorded.value.fileName,
    sizeBytes: recorded.value.sizeBytes,
    status: recorded.value.status,
  });
}

export async function skipTradeProfileAction(): Promise<void> {
  const context = await requireWorkspace();

  const { tradeProfile } = await createServerContainer();
  // Best-effort: even if persisting the skip fails, send the user onward rather
  // than trapping them on the onboarding screen.
  await tradeProfile.markSkipped({
    organizationId: context.organization.id,
    userId: context.profile.id,
  });

  revalidatePath(routes.dashboard);
  redirect(routes.dashboard);
}
