import type { ReactNode } from 'react';

import { ChevronDownIcon } from './icons';
import { cn } from './utils/cn';

/**
 * A disclosure section for optional form fields.
 *
 * Built on native `<details>`, so it is keyboard accessible and works without
 * JavaScript. Essentials stay visible while everything optional folds away
 * behind a labelled header, which is how the onboarding stays calm instead of
 * confronting the user with forty fields at once.
 */
export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-2xl border border-border/70 bg-card/50"
    >
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5',
          'transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        )}
      >
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          {description !== undefined && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <ChevronDownIcon
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-[--duration-base] group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="space-y-4 border-t border-border/60 px-4 py-4">{children}</div>
    </details>
  );
}
