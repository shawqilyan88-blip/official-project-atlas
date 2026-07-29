import type { OrganizationId, UserId } from '@/core/entities';
import type { AppError } from '@/core/errors';
import { failure, type Result, success } from '@/core/result';
import type { AtlasSupabaseClient } from '@/infrastructure/supabase/browser-client';
import type {
  OpportunityMessageRow,
  TablesUpdate,
} from '@/infrastructure/supabase/database.types';
import { mapPostgrestError } from '@/infrastructure/supabase/errors';

import type {
  ConversationMessage,
  MessageDirection,
  MessageStatus,
} from '../domain/outreach';
import type { OpportunityMessageRepository } from '../application/ports';

function toMessage(row: OpportunityMessageRow): ConversationMessage {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    companyId: row.company_id,
    direction: row.direction,
    channel: row.channel,
    subject: row.subject,
    body: row.body,
    status: row.status,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    failedReason: row.failed_reason,
    aiGenerated: row.ai_generated,
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
}

/**
 * Supabase adapter for opportunity messages. RLS scopes to the org. The approval
 * gate is not enforced here — it lives in the application layer, which re-reads
 * status before ever asking a channel to send.
 */
export class SupabaseOpportunityMessageRepository implements OpportunityMessageRepository {
  constructor(private readonly client: AtlasSupabaseClient) {}

  async list(
    opportunityId: string,
  ): Promise<Result<readonly ConversationMessage[], AppError>> {
    const { data, error } = await this.client
      .from('opportunity_messages')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: true });

    if (error) return failure(mapPostgrestError(error));
    return success((data ?? []).map(toMessage));
  }

  async findById(id: string): Promise<Result<ConversationMessage | null, AppError>> {
    const { data, error } = await this.client
      .from('opportunity_messages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return failure(mapPostgrestError(error));
    return success(data ? toMessage(data) : null);
  }

  async createDraft(input: {
    organizationId: OrganizationId;
    opportunityId: string;
    companyId: string;
    userId: UserId;
    direction: MessageDirection;
    channel: string;
    subject: string;
    body: string;
    aiGenerated: boolean;
  }): Promise<Result<ConversationMessage, AppError>> {
    const { data, error } = await this.client
      .from('opportunity_messages')
      .insert({
        organization_id: input.organizationId,
        opportunity_id: input.opportunityId,
        company_id: input.companyId,
        created_by: input.userId,
        direction: input.direction,
        channel: input.channel,
        subject: input.subject,
        body: input.body,
        status: 'draft',
        ai_generated: input.aiGenerated,
      })
      .select('*')
      .single();

    if (error) return failure(mapPostgrestError(error));
    return success(toMessage(data));
  }

  async updateContent(input: {
    id: string;
    subject: string;
    body: string;
    status: MessageStatus;
    aiGenerated?: boolean;
  }): Promise<Result<ConversationMessage, AppError>> {
    const patch: TablesUpdate<'opportunity_messages'> = {
      subject: input.subject,
      body: input.body,
      status: input.status,
      // Editing/regenerating clears any prior approval.
      approved_by: null,
      approved_at: null,
      failed_reason: null,
    };
    if (input.aiGenerated !== undefined) patch.ai_generated = input.aiGenerated;

    const { data, error } = await this.client
      .from('opportunity_messages')
      .update(patch)
      .eq('id', input.id)
      .select('*')
      .single();

    if (error) return failure(mapPostgrestError(error));
    return success(toMessage(data));
  }

  async approve(input: { id: string; userId: UserId }): Promise<Result<void, AppError>> {
    const { error } = await this.client
      .from('opportunity_messages')
      .update({
        status: 'approved',
        approved_by: input.userId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      // Only a draft can be approved — never re-approve something mid-send.
      .eq('status', 'draft');

    if (error) return failure(mapPostgrestError(error));
    return success(undefined);
  }

  async setStatus(input: {
    id: string;
    status: MessageStatus;
    failedReason?: string | null;
  }): Promise<Result<void, AppError>> {
    const patch: TablesUpdate<'opportunity_messages'> = { status: input.status };
    if (input.status === 'sent') patch.sent_at = new Date().toISOString();
    if (input.failedReason !== undefined) patch.failed_reason = input.failedReason;

    const { error } = await this.client
      .from('opportunity_messages')
      .update(patch)
      .eq('id', input.id);

    if (error) return failure(mapPostgrestError(error));
    return success(undefined);
  }
}
