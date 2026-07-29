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
  validationErrorState,
} from '@/shared/lib/action-state';

import { type OpportunityInput, opportunityInputSchema } from './domain/schemas';
import {
  draftOf,
  duplicatedName,
  type OpportunityStatus,
  suggestOpportunityName,
  type TradeOpportunityDraft,
} from './domain/trade-opportunity';

/**
 * Trade Opportunity Server Actions — the full lifecycle.
 *
 * Each re-establishes the caller and their workspace, since a Server Action is
 * a public endpoint. The editor posts one JSON payload plus an optional `id`
 * (edit vs. create) and a `status` (draft vs. active); the lifecycle actions are
 * simple id-keyed form posts.
 */
async function requireWorkspace(): Promise<TenantContext> {
  const session = await getSession();
  if (session.status === 'unauthenticated') redirect(routes.signIn);
  if (session.status === 'needs-onboarding') redirect(routes.onboarding);
  return session.context;
}

function toDraft(input: OpportunityInput): TradeOpportunityDraft {
  const name =
    input.name?.trim() ||
    suggestOpportunityName({
      product: input.product ?? null,
      objective: input.objective,
      markets: input.targetMarkets,
    });

  return {
    name: name.slice(0, 120),
    objective: input.objective,
    product: input.product ?? null,
    category: input.category ?? null,
    targetMarkets: input.targetMarkets,
    minOrderQuantity: input.minOrderQuantity ?? null,
    targetPrice: input.targetPrice ?? null,
    incoterms: input.incoterms,
    requiredCertifications: input.requiredCertifications,
    paymentTerms: input.paymentTerms,
    currencies: input.currencies,
    keywords: input.keywords,
    excludeKeywords: input.excludeKeywords,
    criteria: input.criteria ?? null,
    notes: input.notes ?? null,
  };
}

export async function saveOpportunityAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireWorkspace();

  const raw = formData.get('payload');
  let payload: unknown;
  try {
    payload = JSON.parse(typeof raw === 'string' ? raw : '{}');
  } catch {
    return errorState('We could not read the form. Please try again.');
  }

  const parsed = opportunityInputSchema.safeParse(payload);
  if (!parsed.success) return validationErrorState(parsed.error);

  const status: OpportunityStatus =
    formData.get('status') === 'active' ? 'active' : 'draft';
  const draft = toDraft(parsed.data);

  // A draft can be anything; an active opportunity needs a product to search on.
  if (status === 'active' && (draft.product === null || draft.product.length === 0)) {
    return errorState('Add the product or service you trade before activating.');
  }

  const id = formData.get('id');
  const { tradeOpportunities } = await createServerContainer();

  // On success, land on the opportunity's own dashboard — where Atlas begins
  // working — rather than back in the library list.
  if (typeof id === 'string' && id.length > 0) {
    const result = await tradeOpportunities.update({ id, draft, status });
    if (isFailure(result)) return fromAppError(result.error);
    // Keep the dashboard checklist and list in sync without a manual reload.
    revalidatePath(routes.dashboard);
    revalidatePath(routes.opportunities);
    redirect(`${routes.opportunities}/${id}`);
  }

  const result = await tradeOpportunities.create({
    organizationId: context.organization.id,
    userId: context.profile.id,
    draft,
    status,
  });
  if (isFailure(result)) return fromAppError(result.error);
  // The first opportunity flips the dashboard checklist; revalidate so the
  // next visit reflects it immediately, no reload needed.
  revalidatePath(routes.dashboard);
  revalidatePath(routes.opportunities);
  redirect(`${routes.opportunities}/${result.value.id}`);
}

export async function duplicateOpportunityAction(formData: FormData): Promise<void> {
  const context = await requireWorkspace();
  const id = String(formData.get('id') ?? '');
  if (id.length === 0) redirect(routes.opportunities);

  const { tradeOpportunities } = await createServerContainer();
  const found = await tradeOpportunities.findById(id);
  if (isSuccess(found) && found.value !== null) {
    const created = await tradeOpportunities.create({
      organizationId: context.organization.id,
      userId: context.profile.id,
      draft: { ...draftOf(found.value), name: duplicatedName(found.value.name) },
      status: 'draft',
    });
    // Drop the user straight into the copy so they can adjust it immediately.
    if (isSuccess(created)) {
      revalidatePath(routes.dashboard);
      revalidatePath(routes.opportunities);
      redirect(`${routes.opportunities}/${created.value.id}`);
    }
  }

  redirect(routes.opportunities);
}

export async function setOpportunityStatusAction(formData: FormData): Promise<void> {
  await requireWorkspace();
  const id = String(formData.get('id') ?? '');
  if (id.length === 0) redirect(routes.opportunities);

  const requested = String(formData.get('status') ?? 'archived');
  const status: OpportunityStatus =
    requested === 'active' ? 'active' : requested === 'draft' ? 'draft' : 'archived';

  const { tradeOpportunities } = await createServerContainer();
  await tradeOpportunities.setStatus({ id, status });

  redirect(routes.opportunities);
}

export async function deleteOpportunityAction(formData: FormData): Promise<void> {
  await requireWorkspace();
  const id = String(formData.get('id') ?? '');
  if (id.length === 0) redirect(routes.opportunities);

  const { tradeOpportunities } = await createServerContainer();
  await tradeOpportunities.remove(id);

  // Deleting the last opportunity flips the checklist back; keep it truthful.
  revalidatePath(routes.dashboard);
  revalidatePath(routes.opportunities);
  redirect(routes.opportunities);
}
