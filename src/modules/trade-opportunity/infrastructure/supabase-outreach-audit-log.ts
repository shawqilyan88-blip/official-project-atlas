import type { OrganizationId, UserId } from '@/core/entities';
import type { AppError } from '@/core/errors';
import { failure, type Result, success } from '@/core/result';
import type { AtlasSupabaseClient } from '@/infrastructure/supabase/browser-client';
import type { Json } from '@/infrastructure/supabase/database.types';
import { mapPostgrestError } from '@/infrastructure/supabase/errors';

import type { AuditEvent } from '../domain/outreach';
import type { OutreachAuditLog } from '../application/ports';

/**
 * Append-only outreach audit log. The table grants only SELECT + INSERT, so this
 * adapter can only ever add rows — the compliance record cannot be rewritten.
 */
export class SupabaseOutreachAuditLog implements OutreachAuditLog {
  constructor(private readonly client: AtlasSupabaseClient) {}

  async record(input: {
    organizationId: OrganizationId;
    opportunityId: string;
    companyId?: string | null;
    messageId?: string | null;
    channel?: string | null;
    actor: UserId;
    event: AuditEvent;
    result?: string | null;
    detail?: Readonly<Record<string, unknown>>;
  }): Promise<Result<void, AppError>> {
    const { error } = await this.client.from('outreach_audit_log').insert({
      organization_id: input.organizationId,
      opportunity_id: input.opportunityId,
      company_id: input.companyId ?? null,
      message_id: input.messageId ?? null,
      channel: input.channel ?? null,
      actor: input.actor,
      event: input.event,
      result: input.result ?? null,
      detail: (input.detail ?? {}) as unknown as Json,
    });

    if (error) return failure(mapPostgrestError(error));
    return success(undefined);
  }
}
