import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isSuccess } from '@/core/result';
import {
  assessOpportunityQuality,
  suggestFromHistory,
  summariseOpportunity,
} from '@/modules/trade-opportunity/domain/opportunity-intelligence';
import { createServerContainer } from '@/server/container';
import { requireTenantContext } from '@/server/session';

import { OpportunityWorkspace } from '../_components/opportunity-workspace';

export const metadata: Metadata = {
  title: 'Opportunity',
};

export const dynamic = 'force-dynamic';

/**
 * The opportunity dashboard.
 *
 * Where a created opportunity lands and where Atlas's work shows. Opening it
 * stamps "recently opened", so the library's ordering reflects real attention.
 */
export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const context = await requireTenantContext();

  const { tradeOpportunities, opportunityDocuments, opportunityTimeline } =
    await createServerContainer();
  const result = await tradeOpportunities.findById(id);

  if (!isSuccess(result) || result.value === null) {
    notFound();
  }

  const opportunity = result.value;

  // Fire-and-forget: a failed timestamp write must never block the dashboard.
  void tradeOpportunities.touchOpened(id);

  // Everything the workspace needs, in parallel. Each read degrades to empty on
  // failure (e.g. before the documents migration is applied) — never a crash.
  const [historyResult, documentsResult, timelineResult] = await Promise.all([
    tradeOpportunities.list(context.organization.id),
    opportunityDocuments.list(id),
    opportunityTimeline.list(id),
  ]);
  const history = isSuccess(historyResult) ? historyResult.value : [];
  const documents = isSuccess(documentsResult) ? documentsResult.value : [];
  const timeline = isSuccess(timelineResult) ? timelineResult.value : [];

  const intelligence = {
    summary: summariseOpportunity(opportunity),
    quality: assessOpportunityQuality(opportunity),
    suggestions: suggestFromHistory(opportunity, history),
  };

  return (
    <OpportunityWorkspace
      opportunity={opportunity}
      intelligence={intelligence}
      documents={documents}
      timeline={timeline}
    />
  );
}
