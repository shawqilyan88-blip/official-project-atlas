import type * as React from 'react';

import { cn } from './utils/cn';

/**
 * The surface primitive. Cards group related content and are the main unit of
 * rhythm in the workspace — consistent padding here is most of what makes a
 * dense dashboard feel calm.
 */
export function Card({
  className,
  elevated = false,
  ...props
}: React.ComponentProps<'div'> & { elevated?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground',
        elevated ? 'shadow-raised' : 'shadow-subtle',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3 className={cn('text-base leading-tight font-semibold', className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-sm leading-relaxed text-muted-foreground', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center gap-3 p-6 pt-0', className)} {...props} />;
}
