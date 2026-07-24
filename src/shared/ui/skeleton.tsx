import type * as React from 'react';

import { cn } from './utils/cn';

/**
 * A loading placeholder.
 *
 * Sized to match the content it stands in for, so the page does not jump when
 * real data arrives — the skeleton's purpose is to hold layout, not merely to
 * signal activity. Hidden from assistive technology, which is served better by
 * the `aria-busy` on the surrounding region.
 */
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}
