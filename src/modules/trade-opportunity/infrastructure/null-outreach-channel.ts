import { type Result, success } from '@/core/result';

import type { ChannelSendResult } from '../domain/outreach';
import type { OutreachChannel } from '../application/ports';

/**
 * The placeholder channel used until a real messaging provider is connected.
 *
 * It never sends and never fabricates a delivery — it returns `not_configured`.
 * Connecting a real channel (Resend, Postmark, SMTP, …) is a new adapter added
 * to the container's channel array; this one can stay or be removed.
 */
export class NullOutreachChannel implements OutreachChannel {
  readonly name = 'none';

  async send(_input: {
    subject: string;
    body: string;
    toName: string;
    toWebsite: string | null;
  }): Promise<Result<ChannelSendResult, never>> {
    const result: ChannelSendResult = {
      status: 'not_configured',
      message:
        'No messaging channel is connected. Approve keeps the message ready to send; ' +
        'connect a channel to deliver it.',
    };
    return success(result);
  }
}
