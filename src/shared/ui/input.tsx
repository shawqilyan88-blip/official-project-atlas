import type * as React from 'react';

import { cn } from './utils/cn';

export interface InputProps extends React.ComponentProps<'input'> {
  /**
   * Marks the field as failing validation. Drives both the visual treatment
   * and `aria-invalid`, so the two can never disagree.
   */
  invalid?: boolean;
}

export function Input({ className, type = 'text', invalid, ...props }: InputProps) {
  return (
    <input
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1',
        'text-sm shadow-subtle',
        'placeholder:text-muted-foreground/70',
        'transition-[border-color,box-shadow] duration-[--duration-fast]',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25',
        'focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-60',
        // The file input's own button needs resetting to match the type scale.
        'file:inline-flex file:border-0 file:bg-transparent file:text-foreground',
        'file:text-sm file:font-medium',
        // Error state overrides the focus ring so the problem stays visible
        // while the user is fixing it.
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/25',
        'aria-[invalid=true]:focus-visible:border-destructive',
        className,
      )}
      {...props}
    />
  );
}
