import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isSuccess } from '@/core/result';
import { draftOf } from '@/modules/trade-opportunity/domain/trade-opportunity';
import { createServerContainer } from '@/server/container';
import { requireTenantContext } from '@/server/session';

import { OpportunityEditor } from '../../_components/opportunity-editor';

export const metadata: Metadata = {
  title: 'Edit opportunity',
};

export const dynamic = 'force-dynamic';

/**
 * Edit an existing opportunity.
 *
 * The brief itself — separate from the opportunity dashboard, which is where
 * Atlas's work shows. Saving returns the user to that dashboard.
 */
export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireTenantContext();

  const { tradeOpportunities } = await createServerContainer();
  const result = await tradeOpportunities.findById(id);

  if (!isSuccess(result) || result.value === null) {
    notFound();
  }

  return (
    <OpportunityEditor
      opportunityId={result.value.id}
      initialDraft={draftOf(result.value)}
      inheritedMarkets={[]}
    />
  );
}
