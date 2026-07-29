'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import type { TenantContext } from '@/core/entities';
import { isFailure, isSuccess } from '@/core/result';
import { createServerContainer } from '@/server/container';
import { getSession } from '@/server/session';
import { serverEnv } from '@/shared/config/env';
import { routes } from '@/shared/config/routes';
import {
  type ActionState,
  errorState,
  fromAppError,
  successState,
} from '@/shared/lib/action-state';

import type { OpportunityCompany } from './domain/opportunity-company';
import { type ChannelSendStatus, type DraftContext, isSendable } from './domain/outreach';
import type { TradeOpportunity } from './domain/trade-opportunity';

/**
 * Outreach Server Actions.
 *
 * The approval gate is enforced HERE, on the server: `sendMessage` re-reads the
 * message and refuses unless its persisted status is `approved`. Every draft
 * transition and send attempt is written to the append-only audit log, so a
 * refused or failed send is still recorded.
 */
async function requireWorkspace(): Promise<TenantContext> {
  const session = await getSession();
  if (session.status === 'unauthenticated') redirect(routes.signIn);
  if (session.status === 'needs-onboarding') redirect(routes.onboarding);
  return session.context;
}

const CHANNEL_NAME = 'email';

function buildContext(
  opportunity: TradeOpportunity,
  company: OpportunityCompany,
  profile: {
    products?: readonly string[];
    industry?: string | null;
    description?: string | null;
  } | null,
  workspaceName: string,
): DraftContext {
  return {
    company: {
      name: company.name,
      country: company.country,
      website: company.website,
      role: company.role,
    },
    opportunity: {
      name: opportunity.name,
      product: opportunity.product,
      category: opportunity.category,
      markets: opportunity.targetMarkets,
      objective: opportunity.objective,
    },
    sender: {
      companyName: workspaceName,
      products: profile?.products ?? [],
      industry: profile?.industry ?? null,
      description: profile?.description ?? null,
    },
    // Future AI memory hook — no prior messages are fed in this release.
    priorMessages: [],
  };
}

/** Loads the opportunity, company, and profile needed to draft. */
async function loadDraftInputs(
  context: TenantContext,
  opportunityId: string,
  companyId: string,
) {
  const { tradeOpportunities, opportunityCompanies, tradeProfile } =
    await createServerContainer();
  const [oppResult, companyResult, profileResult] = await Promise.all([
    tradeOpportunities.findById(opportunityId),
    opportunityCompanies.findById(companyId),
    tradeProfile.findByOrganization(context.organization.id),
  ]);
  const opportunity = isSuccess(oppResult) ? oppResult.value : null;
  const company = isSuccess(companyResult) ? companyResult.value : null;
  const profile = isSuccess(profileResult) ? profileResult.value : null;
  return { opportunity, company, profile };
}

export async function draftMessageAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireWorkspace();
  const opportunityId = String(formData.get('opportunityId') ?? '');
  const companyId = String(formData.get('companyId') ?? '');
  if (opportunityId.length === 0 || companyId.length === 0) {
    return errorState('Missing opportunity or company.');
  }

  const { opportunity, company, profile } = await loadDraftInputs(
    context,
    opportunityId,
    companyId,
  );
  if (!opportunity || !company) return errorState('That company no longer exists.');

  const { messageDrafter, opportunityMessages, outreachAuditLog } =
    await createServerContainer();

  const draft = await messageDrafter.draft(
    buildContext(opportunity, company, profile, context.organization.name),
  );
  if (isFailure(draft)) return fromAppError(draft.error);

  const aiGenerated = Boolean(serverEnv().ANTHROPIC_API_KEY);
  const created = await opportunityMessages.createDraft({
    organizationId: context.organization.id,
    opportunityId,
    companyId,
    userId: context.profile.id,
    direction: 'outbound',
    channel: CHANNEL_NAME,
    subject: draft.value.subject,
    body: draft.value.body,
    aiGenerated,
  });
  if (isFailure(created)) return fromAppError(created.error);

  await outreachAuditLog.record({
    organizationId: context.organization.id,
    opportunityId,
    companyId,
    messageId: created.value.id,
    channel: CHANNEL_NAME,
    actor: context.profile.id,
    event: 'draft_created',
    result: aiGenerated ? 'ai' : 'template',
  });

  revalidatePath(`${routes.opportunities}/${opportunityId}`);
  return successState(undefined);
}

export async function regenerateDraftAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireWorkspace();
  const messageId = String(formData.get('messageId') ?? '');
  const opportunityId = String(formData.get('opportunityId') ?? '');
  if (messageId.length === 0) return errorState('Missing message.');

  const { messageDrafter, opportunityMessages, outreachAuditLog } =
    await createServerContainer();
  const existing = await opportunityMessages.findById(messageId);
  if (
    !isSuccess(existing) ||
    existing.value === null ||
    existing.value.companyId === null
  ) {
    return errorState('That draft no longer exists.');
  }

  const { opportunity, company, profile } = await loadDraftInputs(
    context,
    opportunityId,
    existing.value.companyId,
  );
  if (!opportunity || !company) return errorState('That company no longer exists.');

  const draft = await messageDrafter.draft(
    buildContext(opportunity, company, profile, context.organization.name),
  );
  if (isFailure(draft)) return fromAppError(draft.error);

  const updated = await opportunityMessages.updateContent({
    id: messageId,
    subject: draft.value.subject,
    body: draft.value.body,
    status: 'draft',
    aiGenerated: Boolean(serverEnv().ANTHROPIC_API_KEY),
  });
  if (isFailure(updated)) return fromAppError(updated.error);

  await outreachAuditLog.record({
    organizationId: context.organization.id,
    opportunityId,
    companyId: existing.value.companyId,
    messageId,
    channel: CHANNEL_NAME,
    actor: context.profile.id,
    event: 'draft_regenerated',
  });

  revalidatePath(`${routes.opportunities}/${opportunityId}`);
  return successState(undefined);
}

export async function editDraftAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireWorkspace();
  const messageId = String(formData.get('messageId') ?? '');
  const opportunityId = String(formData.get('opportunityId') ?? '');
  const subject = String(formData.get('subject') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  if (messageId.length === 0 || body.length === 0)
    return errorState('Message body is required.');

  const { opportunityMessages, outreachAuditLog } = await createServerContainer();
  // updateContent resets approval → an edited message must be re-approved.
  const updated = await opportunityMessages.updateContent({
    id: messageId,
    subject,
    body,
    status: 'draft',
    aiGenerated: false,
  });
  if (isFailure(updated)) return fromAppError(updated.error);

  await outreachAuditLog.record({
    organizationId: context.organization.id,
    opportunityId,
    companyId: updated.value.companyId,
    messageId,
    channel: CHANNEL_NAME,
    actor: context.profile.id,
    event: 'draft_edited',
  });

  revalidatePath(`${routes.opportunities}/${opportunityId}`);
  return successState(undefined);
}

export async function approveDraftAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireWorkspace();
  const messageId = String(formData.get('messageId') ?? '');
  const opportunityId = String(formData.get('opportunityId') ?? '');
  if (messageId.length === 0) return errorState('Missing message.');

  const { opportunityMessages, outreachAuditLog } = await createServerContainer();
  const existing = await opportunityMessages.findById(messageId);
  if (!isSuccess(existing) || existing.value === null) {
    return errorState('That message no longer exists.');
  }
  if (existing.value.status !== 'draft') {
    return errorState('Only a draft can be approved.');
  }

  const approved = await opportunityMessages.approve({
    id: messageId,
    userId: context.profile.id,
  });
  if (isFailure(approved)) return fromAppError(approved.error);

  await outreachAuditLog.record({
    organizationId: context.organization.id,
    opportunityId,
    companyId: existing.value.companyId,
    messageId,
    channel: CHANNEL_NAME,
    actor: context.profile.id,
    event: 'draft_approved',
  });

  revalidatePath(`${routes.opportunities}/${opportunityId}`);
  return successState(undefined);
}

export interface SendSummary {
  readonly status: ChannelSendStatus;
  readonly message?: string | undefined;
}

export async function sendMessageAction(
  _previousState: ActionState<SendSummary | undefined>,
  formData: FormData,
): Promise<ActionState<SendSummary | undefined>> {
  const context = await requireWorkspace();
  const messageId = String(formData.get('messageId') ?? '');
  const opportunityId = String(formData.get('opportunityId') ?? '');
  if (messageId.length === 0) return errorState('Missing message.');

  const {
    opportunityMessages,
    opportunityCompanies,
    outreachChannels,
    outreachAuditLog,
    opportunityTimeline,
  } = await createServerContainer();

  // --- SERVER-SIDE APPROVAL ENFORCEMENT ---
  const found = await opportunityMessages.findById(messageId);
  if (!isSuccess(found) || found.value === null) {
    return errorState('That message no longer exists.');
  }
  const message = found.value;

  const audit = (
    event: Parameters<typeof outreachAuditLog.record>[0]['event'],
    result?: string,
  ) =>
    outreachAuditLog.record({
      organizationId: context.organization.id,
      opportunityId,
      companyId: message.companyId,
      messageId,
      channel: message.channel,
      actor: context.profile.id,
      event,
      result: result ?? null,
    });

  if (!isSendable(message.status)) {
    // Fail closed: not approved on the server → never sent, but recorded.
    await audit('message_send_attempted', `refused: status=${message.status}`);
    return errorState('This message must be approved before it can be sent.');
  }

  await audit('message_send_attempted', 'approved');
  await opportunityMessages.setStatus({ id: messageId, status: 'sending' });

  // Resolve the recipient for the channel.
  let toName = 'the company';
  let toWebsite: string | null = null;
  if (message.companyId) {
    const company = await opportunityCompanies.findById(message.companyId);
    if (isSuccess(company) && company.value) {
      toName = company.value.name;
      toWebsite = company.value.website;
    }
  }

  const channel = outreachChannels[0];
  if (!channel) {
    await opportunityMessages.setStatus({ id: messageId, status: 'approved' });
    return errorState('No messaging channel is available.');
  }
  const sent = await channel.send({
    subject: message.subject ?? '',
    body: message.body,
    toName,
    toWebsite,
  });

  if (isFailure(sent)) {
    await opportunityMessages.setStatus({
      id: messageId,
      status: 'failed',
      failedReason: sent.error.message,
    });
    await audit('message_failed', sent.error.message);
    revalidatePath(`${routes.opportunities}/${opportunityId}`);
    return successState({ status: 'failed', message: sent.error.message });
  }

  const result = sent.value;
  if (result.status === 'sent') {
    await opportunityMessages.setStatus({ id: messageId, status: 'sent' });
    await audit('message_sent', result.providerMessageId ?? 'sent');
    if (message.companyId) {
      await opportunityCompanies.setStatus({
        id: message.companyId,
        status: 'contacted',
      });
    }
    await opportunityTimeline.record({
      organizationId: context.organization.id,
      opportunityId,
      userId: context.profile.id,
      kind: 'message_sent',
      title: `Message sent${message.subject ? `: ${message.subject}` : ''}`,
    });
  } else {
    // not_configured — keep the message approved and ready; nothing was sent.
    await opportunityMessages.setStatus({ id: messageId, status: 'approved' });
    await audit('message_failed', result.status);
  }

  revalidatePath(`${routes.opportunities}/${opportunityId}`);
  return successState({ status: result.status, message: result.message ?? undefined });
}
