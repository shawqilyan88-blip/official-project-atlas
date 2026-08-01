/**
 * Outreach domain — messages, drafting context, and sending.
 *
 * Pure data + rules. The approval gate is modelled here as message state:
 * a message may only be sent while `status === 'approved'`, and any edit to an
 * approved draft must return it to `draft` (enforced in the application layer).
 * Nothing here talks to an AI model or a messaging channel.
 */

export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'draft' | 'approved' | 'sending' | 'sent' | 'failed';

export const MESSAGE_STATUS_LABEL: Readonly<Record<MessageStatus, string>> = {
  draft: 'Draft',
  approved: 'Approved',
  sending: 'Sending',
  sent: 'Sent',
  failed: 'Failed',
};

export interface ConversationMessage {
  readonly id: string;
  readonly opportunityId: string;
  readonly companyId: string | null;
  readonly direction: MessageDirection;
  readonly channel: string | null;
  readonly subject: string | null;
  readonly body: string;
  readonly status: MessageStatus;
  readonly approvedBy: string | null;
  readonly approvedAt: string | null;
  readonly failedReason: string | null;
  readonly aiGenerated: boolean;
  readonly sentAt: string | null;
  readonly createdAt: string;
}

/**
 * How a draft was actually produced. `ai` means a model wrote it; `template`
 * means the honest fallback template was used (no key, or the model call
 * failed). This travels with the draft so the UI labels provenance by what
 * really happened, never by whether a key is merely present.
 */
export type DraftSource = 'ai' | 'template';

/** A drafted message before it is persisted. */
export interface MessageDraft {
  readonly subject: string;
  readonly body: string;
  readonly source: DraftSource;
}

/**
 * Everything the drafter is given. `priorMessages` is the seam for future AI
 * memory — previous conversation with this company can be fed to the model
 * without changing the port or the adapter. It is empty in this release.
 */
export interface DraftContext {
  readonly company: {
    readonly name: string;
    readonly country: string | null;
    readonly website: string | null;
    readonly role: string;
  };
  readonly opportunity: {
    readonly name: string;
    readonly product: string | null;
    readonly category: string | null;
    readonly markets: readonly string[];
    readonly objective: string;
  };
  readonly sender: {
    readonly companyName: string;
    readonly products: readonly string[];
    readonly industry: string | null;
    readonly description: string | null;
  };
  /** Future AI memory — prior messages with this company. Empty today. */
  readonly priorMessages: readonly ConversationMessage[];
}

export type ChannelSendStatus = 'sent' | 'not_configured' | 'failed';

export interface ChannelSendResult {
  readonly status: ChannelSendStatus;
  readonly providerMessageId?: string | null;
  readonly message?: string | null;
}

/** The audit events, matching the outreach_audit_event enum. */
export const AUDIT_EVENTS = [
  'draft_created',
  'draft_regenerated',
  'draft_edited',
  'draft_approved',
  'message_send_attempted',
  'message_sent',
  'message_failed',
  'reply_received',
] as const;
export type AuditEvent = (typeof AUDIT_EVENTS)[number];

/** The single source of truth for "may this message be sent?". */
export function isSendable(status: MessageStatus): boolean {
  return status === 'approved';
}
