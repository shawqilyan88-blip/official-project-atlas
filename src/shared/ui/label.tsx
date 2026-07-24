'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import type * as React from 'react';

import { cn } from './utils/cn';

export function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-sm leading-none font-medium text-foreground select-none',
        // Grey out in step with the control the label points at.
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}
