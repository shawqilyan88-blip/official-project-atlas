'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import type * as React from 'react';

import { XIcon } from './icons';
import { cn } from './utils/cn';

/**
 * An edge-anchored panel, built on Radix Dialog.
 *
 * Used for the sidebar on small screens. Dialog is the right primitive rather
 * than a styled `<div>`: it traps focus, closes on Escape, marks the rest of
 * the page inert for screen readers, and returns focus to the trigger. A
 * hand-rolled drawer gets none of that, and the omission is invisible until
 * someone navigates by keyboard.
 */

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = 'left',
  title,
  description,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: 'left' | 'right';
  /** Required: every dialog needs an accessible name. */
  title: string;
  description?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]',
          'data-[state=closed]:animate-out data-[state=open]:animate-in',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 flex h-full bg-sidebar text-sidebar-foreground',
          'w-[17rem] flex-col border-r shadow-overlay',
          'transition ease-[--ease-out-quart]',
          'data-[state=closed]:animate-out data-[state=open]:animate-in',
          'data-[state=closed]:duration-200 data-[state=open]:duration-300',
          side === 'left'
            ? 'left-0 border-sidebar-border data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
            : 'right-0 border-r-0 border-l border-sidebar-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          className,
        )}
        {...props}
      >
        {/* Visually hidden but announced — satisfies the dialog naming
            requirement without imposing a visible header on every sheet. */}
        <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
        {description !== undefined && (
          <DialogPrimitive.Description className="sr-only">
            {description}
          </DialogPrimitive.Description>
        )}

        {children}

        <DialogPrimitive.Close
          className={cn(
            'absolute top-3.5 right-3.5 rounded-md p-1 ring-offset-background',
            'text-muted-foreground opacity-80 transition hover:text-foreground',
            'hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring',
            'focus-visible:ring-offset-2 focus-visible:outline-none',
          )}
        >
          <XIcon className="size-4" aria-hidden="true" />
          <span className="sr-only">Close navigation</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
