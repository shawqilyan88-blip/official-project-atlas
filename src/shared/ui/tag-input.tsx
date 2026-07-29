'use client';

import { type KeyboardEvent, useId } from 'react';

import { XIcon } from '@/shared/ui/icons';

import { cn } from './utils/cn';

/**
 * A chips input for short lists — products, markets, certifications, keywords.
 *
 * Typing and pressing Enter or comma commits a value; Backspace on an empty
 * field removes the last chip. It is controlled, and the in-progress `draft` is
 * lifted so the parent can fold a half-typed entry into the list on submit.
 */
export function TagInput({
  label,
  hint,
  placeholder,
  values,
  draft,
  onDraftChange,
  onChange,
  max = 30,
}: {
  readonly label: string;
  readonly hint?: string;
  readonly placeholder?: string;
  readonly values: readonly string[];
  readonly draft: string;
  readonly onDraftChange: (value: string) => void;
  readonly onChange: (values: readonly string[]) => void;
  readonly max?: number;
}) {
  const inputId = useId();

  const commit = (raw: string) => {
    const value = raw.trim().replace(/,+$/, '').trim();
    if (value.length === 0) return;
    if (values.some((existing) => existing.toLowerCase() === value.toLowerCase())) {
      onDraftChange('');
      return;
    }
    if (values.length >= max) return;
    onChange([...values, value]);
    onDraftChange('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit(draft);
    } else if (event.key === 'Backspace' && draft.length === 0 && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>

      <div
        className={cn(
          'flex flex-wrap gap-1.5 rounded-xl border border-input bg-background/80 p-2',
          'transition focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/15',
        )}
      >
        {values.map((value, index) => (
          <span
            key={value}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 py-1 pr-1 pl-2 text-[0.8125rem] font-medium text-primary"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="flex size-4 items-center justify-center rounded text-primary/70 transition-colors hover:bg-primary/20 hover:text-primary"
              aria-label={`Remove ${value}`}
            >
              <XIcon className="size-3" aria-hidden="true" />
            </button>
          </span>
        ))}

        <input
          id={inputId}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
          placeholder={values.length === 0 ? placeholder : 'Add another…'}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground/70"
        />
      </div>

      {hint !== undefined && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
