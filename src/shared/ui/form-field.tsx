'use client';

import { useId } from 'react';
import type * as React from 'react';

import { InfoTooltip } from './info-tooltip';
import { Input, type InputProps } from './input';
import { Label } from './label';
import { OptionalBadge, type OptionalLevel } from './optional-badge';
import { cn } from './utils/cn';

export interface FormFieldProps extends Omit<InputProps, 'id' | 'invalid'> {
  label: string;
  /** Guidance shown under the control, before any error appears. */
  hint?: string;
  /** An educational tooltip attached to the label via an ⓘ affordance. */
  info?: string;
  /** Marks the field as optional (or optional-but-recommended) in the label. */
  optional?: OptionalLevel;
  /** Validation messages for this field. Presence switches it to the error state. */
  errors?: readonly string[] | undefined;
}

/**
 * Label, control, hint, and error as one unit.
 *
 * The accessibility wiring is the reason this exists. Getting `htmlFor`,
 * `aria-describedby`, and `aria-invalid` right is mechanical, easy to forget,
 * and completely invisible when it is wrong — a screen reader user simply
 * never hears why the form rejected them. Centralising it means every field in
 * the product is correct by construction rather than by review.
 */
export function FormField({
  label,
  hint,
  info,
  optional,
  errors,
  className,
  required,
  ...inputProps
}: FormFieldProps) {
  const fieldId = useId();
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;

  const hasErrors = errors !== undefined && errors.length > 0;

  // Only reference ids that are actually rendered: pointing at a missing
  // element makes some screen readers skip the description entirely.
  const describedBy =
    [hint !== undefined ? hintId : null, hasErrors ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={fieldId}>
        {label}
        {required === true && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
        {optional !== undefined && <OptionalBadge level={optional} />}
        {info !== undefined && (
          <span className="ml-1.5">
            <InfoTooltip label={label}>{info}</InfoTooltip>
          </span>
        )}
      </Label>

      <Input
        id={fieldId}
        invalid={hasErrors}
        required={required}
        aria-describedby={describedBy}
        {...inputProps}
      />

      {hint !== undefined && !hasErrors && (
        <p id={hintId} className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}

      {hasErrors && (
        <ul id={errorId} className="space-y-0.5">
          {errors.map((message) => (
            <li key={message} className="text-xs leading-relaxed text-destructive">
              {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * A live region for whole-form failures — the ones that belong to no single
 * field, such as "that email and password do not match".
 */
export function FormMessage({
  children,
  className,
  ...props
}: React.ComponentProps<'p'>) {
  if (children === undefined || children === null) return null;

  return (
    <p
      role="alert"
      className={cn('text-sm leading-relaxed text-destructive', className)}
      {...props}
    >
      {children}
    </p>
  );
}
