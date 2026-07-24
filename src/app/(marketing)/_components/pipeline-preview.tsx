import { PreviewFrame } from './preview-frame';
import { PIPELINE } from './sample-data';

/**
 * The deal board.
 *
 * Kept deliberately plain — a pipeline is a familiar object, and the value on
 * this page is showing that trade deals land somewhere structured rather than
 * in a spreadsheet. On narrow screens the columns scroll horizontally inside
 * their own container so the page body never scrolls sideways.
 */
export function PipelinePreview({ className }: { className?: string }) {
  return (
    <PreviewFrame
      label="A deal pipeline with four stages — qualified, in conversation, quoted, and contract — each holding buyer deals with their value and age."
      view="Deals · Q1 pipeline"
      className={className}
      contentClassName="overflow-x-auto"
    >
      <div className="flex min-w-[34rem] gap-3 p-3.5">
        {PIPELINE.map((stage) => (
          <div key={stage.id} className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-1 px-0.5">
              <span className="truncate text-[0.6875rem] font-medium">{stage.name}</span>
              <span className="tabular rounded-full bg-muted px-1.5 text-[0.5625rem] text-muted-foreground">
                {stage.deals.length}
              </span>
            </div>

            <div className="space-y-2">
              {stage.deals.map((deal) => (
                <div
                  key={deal.company}
                  className="rounded-md border border-border/70 bg-background p-2 shadow-subtle"
                >
                  <p className="truncate text-[0.6875rem] leading-tight font-medium">
                    {deal.company}
                  </p>
                  <p className="mt-1.5 flex items-baseline justify-between gap-1">
                    <span className="tabular text-[0.75rem] font-semibold">
                      {deal.value}
                    </span>
                    <span className="tabular text-[0.625rem] text-muted-foreground">
                      {deal.age}
                    </span>
                  </p>
                </div>
              ))}

              {/* An empty slot keeps short columns from collapsing and makes the
                  board read as a board rather than a ragged list. */}
              {stage.deals.length < 2 && (
                <div
                  className="h-[3.25rem] rounded-md border border-dashed border-border/50"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </PreviewFrame>
  );
}
