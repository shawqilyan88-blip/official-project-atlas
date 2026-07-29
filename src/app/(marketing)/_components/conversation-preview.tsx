import { cn } from '@/shared/ui';

import { PreviewFrame } from './preview-frame';
import { CONVERSATION, CONVERSATION_RATIONALE } from './sample-data';

/**
 * A live buyer thread with an Atlas-drafted reply held for approval.
 *
 * The point this preview has to make is the approval gate: Atlas drafts, a
 * person sends. The draft is visibly pending rather than already delivered,
 * because software that emails your customers unsupervised is a liability, not
 * a feature — and the interface should say so before anyone asks.
 */
export function ConversationPreview({ className }: { className?: string }) {
  return (
    <PreviewFrame
      label="A buyer conversation in French, with a reply drafted by Atlas held for approval and translated into English alongside it."
      view={`Conversations · ${CONVERSATION.company}`}
      className={className}
    >
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-[0.5625rem] font-semibold text-accent-foreground">
          CV
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[0.75rem] font-medium">
            {CONVERSATION.company}
          </span>
          <span className="block text-[0.625rem] text-muted-foreground">
            {CONVERSATION.channel}
          </span>
        </span>
        <span className="ml-auto shrink-0 rounded-full bg-success/12 px-2 py-0.5 text-[0.625rem] font-medium text-success">
          Active
        </span>
      </div>

      <div className="space-y-3 p-4">
        {CONVERSATION.messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex flex-col gap-1',
              message.side === 'us' ? 'items-end' : 'items-start',
            )}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-lg px-3 py-2 text-[0.75rem] leading-relaxed',
                message.side === 'us'
                  ? 'border border-primary/20 bg-primary/[0.07]'
                  : 'border border-border/60 bg-muted/60',
              )}
            >
              {message.drafted === true && (
                <span className="mb-1 flex items-center gap-1 text-[0.625rem] font-medium text-primary">
                  <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true">
                    <path
                      d="M8 2.2 9.5 6l3.8 1.5L9.5 9 8 12.8 6.5 9 2.7 7.5 6.5 6 8 2.2Z"
                      className="fill-current"
                    />
                  </svg>
                  Drafted by Atlas · awaiting your approval
                </span>
              )}
              {message.body}
            </div>

            <span className="px-1 text-[0.625rem] text-muted-foreground">
              {message.author} · {message.time}
            </span>
          </div>
        ))}

        {/* Why the draft says what it says. Reasoning shown inline is what makes
            an approval step meaningful rather than a rubber stamp. */}
        <div className="ml-auto max-w-[85%] rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-2">
          <p className="text-[0.5625rem] font-medium tracking-wide text-muted-foreground uppercase">
            Why this reply
          </p>
          <p className="mt-1 text-[0.6875rem] leading-relaxed text-muted-foreground">
            {CONVERSATION_RATIONALE}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border/70 px-4 py-2.5">
        <span className="flex h-6 items-center rounded-md bg-primary px-2.5 text-[0.625rem] font-medium text-primary-foreground">
          Approve &amp; send
        </span>
        <span className="flex h-6 items-center rounded-md border border-border px-2.5 text-[0.625rem] font-medium text-muted-foreground">
          Edit
        </span>
      </div>
    </PreviewFrame>
  );
}
