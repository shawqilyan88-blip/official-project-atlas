import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XCircleIcon } from './icons';
import { cn } from './utils/cn';

const alertVariants = cva(
  'relative flex w-full gap-3 rounded-lg border px-4 py-3 text-sm',
  {
    variants: {
      tone: {
        info: 'bg-muted/60 border-border text-foreground',
        success: 'bg-success/10 border-success/25 text-foreground',
        warning: 'bg-warning/10 border-warning/30 text-foreground',
        error: 'bg-destructive/8 border-destructive/25 text-foreground',
      },
    },
    defaultVariants: { tone: 'info' },
  },
);

const TONE_ICON = {
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  error: XCircleIcon,
} as const;

const TONE_ICON_CLASS = {
  info: 'text-muted-foreground',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
} as const;

export interface AlertProps
  extends Omit<React.ComponentProps<'div'>, 'title'>, VariantProps<typeof alertVariants> {
  title?: React.ReactNode;
}

export function Alert({ className, tone, title, children, ...props }: AlertProps) {
  const resolvedTone = tone ?? 'info';
  const Icon = TONE_ICON[resolvedTone];

  return (
    <div
      // Errors interrupt; anything else waits for a natural pause in speech.
      role={resolvedTone === 'error' ? 'alert' : 'status'}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    >
      <Icon
        className={cn('mt-0.5 size-4 shrink-0', TONE_ICON_CLASS[resolvedTone])}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1 space-y-1">
        {title !== undefined && <p className="leading-snug font-medium">{title}</p>}
        {children !== undefined && (
          <div className="leading-relaxed text-muted-foreground">{children}</div>
        )}
      </div>
    </div>
  );
}
