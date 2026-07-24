import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from './utils/cn';

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
    'text-xs font-medium whitespace-nowrap',
    '[&_svg]:size-3 [&_svg]:shrink-0',
  ],
  {
    variants: {
      tone: {
        neutral: 'bg-muted text-muted-foreground border-transparent',
        brand: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-success/12 text-success border-success/25',
        warning: 'bg-warning/15 text-warning-foreground border-warning/30',
        danger: 'bg-destructive/10 text-destructive border-destructive/25',
        outline: 'text-foreground border-border bg-transparent',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { badgeVariants };
