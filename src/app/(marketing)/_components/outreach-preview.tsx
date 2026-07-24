import { cn } from '@/shared/ui';

import { PreviewFrame } from './preview-frame';
import { OUTREACH_DRAFT, OUTREACH_SEQUENCE } from './sample-data';

/**
 * A sequence that reacts to the recipient rather than running on a timer.
 *
 * Two details carry the argument. The follow-up step is in a *waiting* state —
 * "holds until they reply" — which is the difference between a sequence and a
 * mail merge. And the scheduled step names a local send time, because 08:30 in
 * Hamburg is the middle of the night somewhere else, and that is exactly the
 * kind of detail that gets a first email deleted.
 */
export function OutreachPreview({ className }: { className?: string }) {
  return (
    <PreviewFrame
      label="An outreach sequence with two steps sent, a follow-up holding until the buyer replies, and a sample offer scheduled for the recipient's local morning, beside the drafted German email with merge fields resolved."
      view="Outreach · Stoneware — DE importers"
      className={className}
    >
      <div className="grid gap-0 md:grid-cols-[1fr_1.25fr]">
        {/* Sequence timeline */}
        <div className="border-b border-border/70 p-4 md:border-r md:border-b-0">
          <p className="text-[0.625rem] font-medium tracking-wider text-muted-foreground uppercase">
            Sequence
          </p>

          <ol className="mt-3 space-y-3">
            {OUTREACH_SEQUENCE.map((step, index) => {
              const isLast = index === OUTREACH_SEQUENCE.length - 1;
              return (
                <li key={step.id} className="relative flex gap-2.5">
                  {!isLast && (
                    <span
                      className="absolute top-[18px] left-[8px] h-[calc(100%+4px)] w-px bg-border"
                      aria-hidden="true"
                    />
                  )}

                  <span
                    className={cn(
                      'relative z-10 mt-0.5 flex size-[17px] shrink-0 items-center justify-center rounded-full border-2',
                      step.state === 'sent'
                        ? 'border-success/30 bg-success/15 text-success'
                        : step.state === 'scheduled'
                          ? 'border-primary/30 bg-primary/12 text-primary'
                          : 'border-border bg-card text-muted-foreground',
                    )}
                  >
                    {step.state === 'sent' ? (
                      <svg viewBox="0 0 16 16" className="size-2.5" aria-hidden="true">
                        <path
                          d="m4 8.4 2.6 2.6L12 5.4"
                          className="fill-none stroke-current"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.75rem] leading-tight font-medium">
                      {step.label}
                    </span>
                    <span
                      className={cn(
                        'mt-0.5 block text-[0.625rem]',
                        step.state === 'waiting'
                          ? 'font-medium text-primary'
                          : 'text-muted-foreground',
                      )}
                    >
                      {step.timing}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Drafted message */}
        <div className="p-4">
          <p className="text-[0.625rem] font-medium tracking-wider text-muted-foreground uppercase">
            Draft
          </p>

          <p className="mt-3 text-[0.75rem] font-medium">{OUTREACH_DRAFT.subject}</p>

          <p className="mt-2 text-[0.6875rem] leading-relaxed whitespace-pre-line text-muted-foreground">
            {OUTREACH_DRAFT.body.map((segment, index) =>
              segment.field === true ? (
                <span
                  key={index}
                  className="rounded-[3px] bg-primary/10 px-1 py-px font-medium text-primary"
                >
                  {segment.text}
                </span>
              ) : (
                <span key={index}>{segment.text}</span>
              ),
            )}
          </p>

          <p className="mt-3 border-t border-border/70 pt-2.5 text-[0.625rem] text-muted-foreground">
            {OUTREACH_DRAFT.meta}
          </p>
        </div>
      </div>
    </PreviewFrame>
  );
}
