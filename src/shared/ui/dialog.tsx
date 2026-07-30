'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import type * as React from 'react';

import { XIcon } from './icons';
import { cn } from './utils/cn';

/**
 * A centred modal dialog, built on Radix Dialog.
 *
 * Like {@link Sheet}, this exists so the hard, invisible parts are never
 * hand-rolled: Radix traps focus inside the dialog, closes on Escape, marks the
 * rest of the page inert for assistive technology, and returns focus to the
 * trigger on close. A styled `<div role="dialog">` gets none of that, and the
 * gap is silent until someone navigates by keyboard.
 */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  title,
  description,
  showClose = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** Required: every dialog needs an accessible name. Rendered visually hidden. */
  title: string;
  description?: string;
  /** Renders the built-in close affordance in the top-right. */
  showClose?: boolean;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-[80] bg-scrim p-4 backdrop-blur-sm',
          'data-[state=closed]:animate-out data-[state=open]:animate-in',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          'animate-pop fixed top-1/2 left-1/2 z-[80] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
          'rounded-2xl border border-border bg-card text-card-foreground shadow-overlay',
          className,
        )}
        {...props}
      >
        {/* Visually hidden but announced — satisfies the dialog naming
            requirement without imposing a visible header on every dialog. */}
        <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
        {description !== undefined && (
          <DialogPrimitive.Description className="sr-only">
            {description}
          </DialogPrimitive.Description>
        )}

        {children}

        {showClose && (
          <DialogPrimitive.Close
            className={cn(
              'focus-ring absolute top-3 right-3 flex size-7 items-center justify-center rounded-md',
              'text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            )}
          >
            <XIcon className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
