'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { Loader2Icon } from './icons';
import { cn } from './utils/cn';

/*
 * This module is a client boundary because `@radix-ui/react-slot` — which
 * powers `asChild` — calls `React.createContext` at import time and ships no
 * `'use client'` directive of its own. React's server build does not implement
 * `createContext`, so without this directive a Server Component importing
 * `Button` drags Slot into the React Server Components graph and the build
 * fails while collecting page data with `TypeError: createContext is not a
 * function`.
 *
 * A button is interactive anyway, so the boundary belongs here regardless.
 */

/**
 * The button variants are the visual grammar of the product: one primary
 * action per view, everything else quieter. Adding a variant is a design
 * decision, not a local styling choice, which is why they live here rather
 * than as ad-hoc class strings at call sites.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-md font-medium select-none',
    'transition-[background-color,border-color,color,box-shadow,transform]',
    'duration-[--duration-fast] ease-[--ease-out-quart]',
    // Pressing gives a small physical acknowledgement.
    'active:scale-[0.985]',
    'focus-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    // Icons should never stretch, and never intercept the click.
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-subtle hover:bg-primary-hover',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border',
        outline:
          'border-input bg-background hover:bg-accent hover:text-accent-foreground border',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        subtle: 'bg-muted text-foreground hover:bg-muted/70',
        destructive:
          'bg-destructive text-destructive-foreground shadow-subtle hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 gap-1.5 px-3 text-caption',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-[0.9375rem]',
        // Square sizes for icon-only buttons.
        icon: 'size-9',
        'icon-sm': 'size-8',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      block: false,
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /** Render as the child element instead of a `<button>` — e.g. wrapping a Link. */
  asChild?: boolean;
  /** Shows a spinner and blocks interaction. Width is preserved to avoid layout shift. */
  loading?: boolean;
  /** Announced to screen readers while `loading`. */
  loadingLabel?: string;
}

export function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  loading = false,
  loadingLabel = 'Working…',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  // Slot forwards its props onto a single child element, so the spinner
  // treatment below — which wraps children in a fragment — cannot apply. A
  // link-shaped button has no submit to guard against anyway.
  const showSpinner = loading && !asChild;

  return (
    <Component
      className={cn(buttonVariants({ variant, size, block }), className)}
      // A loading button must not be re-submittable.
      disabled={disabled === true || showSpinner}
      // `aria-busy` tells assistive tech the control is working rather than broken.
      aria-busy={showSpinner || undefined}
      {...props}
    >
      {showSpinner ? (
        <>
          <Loader2Icon className="animate-spin" aria-hidden="true" />
          <span className="sr-only">{loadingLabel}</span>
          {/* Keeps the label's width so the button does not resize mid-submit. */}
          <span aria-hidden="true">{children}</span>
        </>
      ) : (
        children
      )}
    </Component>
  );
}

export { buttonVariants };
