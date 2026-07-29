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

import { runDiscoveryProviders } from './application/discovery-service';
import { buildDiscoveryQuery, type DiscoveryStatus } from './domain/discovery';
import { COMPANY_STATUSES, type CompanyStatus } from './domain/opportunity-company';

async function requireWorkspace(): Promise<TenantContext> {
  const session = await getSession();
  if (session.status === 'unauthenticated') redirect(routes.signIn);
  if (session.status === 'needs-onboarding') redirect(routes.onboarding);
  return session.context;
}

export interface DiscoveryRunSummary {
  readonly status: DiscoveryStatus;
  readonly added: number;
  readonly message?: string | undefined;
}

export async function runDiscoveryAction(
  _previousState: ActionState<DiscoveryRunSummary | undefined>,
  formData: FormData,
): Promise<ActionState<DiscoveryRunSummary | undefined>> {
  const context = await requireWorkspace();

  const opportunityId = String(formData.get('opportunityId') ?? '');
  if (opportunityId.length === 0) return errorState('Missing opportunity.');

  const {
    tradeOpportunities,
    tradeProfile,
    discoveryProviders,
    companyRanker,
    opportunityCompanies,
    opportunityTimeline,
  } = await createServerContainer();

  const found = await tradeOpportunities.findById(opportunityId);
  if (!isSuccess(found) || found.value === null) {
    return errorState('That opportunity no longer exists.');
  }

  const profileResult = await tradeProfile.findByOrganization(context.organization.id);
  const profile = isSuccess(profileResult) ? profileResult.value : null;

  const query = buildDiscoveryQuery(found.value, {
    products: profile?.products,
    industry: profile?.industry,
  });

  // Query every provider in parallel and merge — one provider today, many later.
  const outcome = await runDiscoveryProviders(discoveryProviders, query);

  let added = 0;
  if (outcome.candidates.length > 0) {
    const ranked = await companyRanker.rank(query, outcome.candidates);
    if (isFailure(ranked)) return fromAppError(ranked.error);

    const result = await opportunityCompanies.add({
      organizationId: context.organization.id,
      opportunityId,
      userId: context.profile.id,
      companies: ranked.value.map((r) => ({
        role: r.candidate.role === 'buyer' ? 'buyer' : 'supplier',
        name: r.candidate.name,
        country: r.candidate.country,
        website: r.candidate.website,
        fitScore: r.fitScore,
        source: r.candidate.sources.join(', ') || null,
      })),
    });
    if (isFailure(result)) return fromAppError(result.error);
    added = result.value;
  }

  // Record every run honestly, whether or not it found anything.
  await opportunityTimeline.record({
    organizationId: context.organization.id,
    opportunityId,
    userId: context.profile.id,
    kind: 'discovery_run',
    title:
      outcome.status === 'ok'
        ? `Discovery surfaced ${added} compan${added === 1 ? 'y' : 'ies'}`
        : 'Ran discovery — no provider connected',
    detail: outcome.status !== 'ok' ? (outcome.message ?? null) : null,
  });

  revalidatePath(`${routes.opportunities}/${opportunityId}`);
  return successState({ status: outcome.status, added, message: outcome.message });
}

export async function setCompanyStatusAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireWorkspace();

  const id = String(formData.get('id') ?? '');
  const opportunityId = String(formData.get('opportunityId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (id.length === 0 || !COMPANY_STATUSES.includes(status as CompanyStatus)) {
    return errorState('Invalid request.');
  }

  const { opportunityCompanies } = await createServerContainer();
  const result = await opportunityCompanies.setStatus({
    id,
    status: status as CompanyStatus,
  });
  if (isFailure(result)) return fromAppError(result.error);

  revalidatePath(`${routes.opportunities}/${opportunityId}`);
  return successState(undefined);
}
