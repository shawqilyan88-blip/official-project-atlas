'use client';

import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  GLOBAL_VALUE,
  MARKET_BY_VALUE,
  MARKET_OPTIONS,
  type MarketOption,
} from '@/shared/data/markets';

import { Globe2Icon, MapPinIcon, SearchIcon, XIcon } from './icons';
import { OptionalBadge, type OptionalLevel } from './optional-badge';
import { useAnchoredPosition } from './use-anchored-position';
import { cn } from './utils/cn';

/**
 * Target Markets — a searchable, virtualized multi-select over every country
 * and the common business regions.
 *
 * Why bespoke rather than a tag input: markets are a closed set, so users should
 * pick, never type. It is a proper combobox — arrow keys move the active option,
 * Enter toggles it, Escape closes — and the option list is windowed so 200+ rows
 * (and their flag SVGs) never all mount at once. `Global` is mutually exclusive
 * with specific markets: choosing it clears the rest and disables them until it
 * is removed, so a selection can never contradict itself.
 */
const ROW_HEIGHT = 40;
const VIEWPORT_HEIGHT = 288;
const OVERSCAN = 6;

export function MarketSelect({
  label,
  optional,
  hint,
  values,
  onChange,
  placeholder = 'Search countries or regions…',
}: {
  readonly label: string;
  readonly optional?: OptionalLevel;
  readonly hint?: string;
  readonly values: readonly string[];
  readonly onChange: (values: readonly string[]) => void;
  readonly placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { style: panelStyle, listMaxHeight } = useAnchoredPosition(
    open,
    triggerRef,
    VIEWPORT_HEIGHT,
  );

  const listId = useId();
  const optionId = (index: number) => `${listId}-opt-${index}`;

  const globalSelected = values.includes(GLOBAL_VALUE);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return MARKET_OPTIONS;
    return MARKET_OPTIONS.filter((option) => option.search.includes(needle));
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      // The panel is portaled to <body>, so check it separately from the field.
      if (
        !containerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const openPanel = () => {
    setOpen(true);
    setActiveIndex(0);
    // Focus the search box once the panel has mounted.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const scrollActiveIntoView = (index: number) => {
    const list = listRef.current;
    if (!list) return;
    const top = index * ROW_HEIGHT;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (top + ROW_HEIGHT > list.scrollTop + VIEWPORT_HEIGHT) {
      list.scrollTop = top + ROW_HEIGHT - VIEWPORT_HEIGHT;
    }
  };

  const toggle = (value: string) => {
    if (value === GLOBAL_VALUE) {
      onChange(values.includes(GLOBAL_VALUE) ? [] : [GLOBAL_VALUE]);
      return;
    }
    if (globalSelected) return; // specific markets are disabled while Global is on
    onChange(
      values.includes(value)
        ? values.filter((entry) => entry !== value)
        : [...values, value],
    );
  };

  const remove = (value: string) => onChange(values.filter((entry) => entry !== value));

  const isDisabled = (option: MarketOption) =>
    globalSelected && option.value !== GLOBAL_VALUE;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = Math.min(filtered.length - 1, activeIndex + 1);
      setActiveIndex(next);
      scrollActiveIntoView(next);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const next = Math.max(0, activeIndex - 1);
      setActiveIndex(next);
      scrollActiveIntoView(next);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option && !isDisabled(option)) toggle(option.value);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Backspace' && query.length === 0 && values.length > 0) {
      remove(values[values.length - 1] as string);
    }
  };

  // Virtualized window.
  const total = filtered.length;
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const end = Math.min(
    total,
    Math.ceil((scrollTop + listMaxHeight) / ROW_HEIGHT) + OVERSCAN,
  );
  const windowed = filtered.slice(start, end);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="block text-sm font-medium" id={`${listId}-label`}>
        {label}
        {optional !== undefined && <OptionalBadge level={optional} />}
      </label>

      {/* The field: selected chips plus a click target that opens the combobox. */}
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={openPanel}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
            event.preventDefault();
            openPanel();
          }
        }}
        className={cn(
          'flex min-h-[2.75rem] w-full flex-wrap items-center gap-1.5 rounded-xl border border-input bg-background/80 p-2 text-left',
          'cursor-text transition focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/15',
          open && 'border-primary/50 ring-4 ring-primary/15',
        )}
      >
        {values.map((value) => (
          <Chip key={value} value={value} onRemove={() => remove(value)} />
        ))}
        {values.length === 0 && (
          <span className="px-1 text-sm text-muted-foreground/70">Select markets…</span>
        )}
        <Globe2Icon
          className="ml-auto size-4 shrink-0 text-muted-foreground/60"
          aria-hidden="true"
        />
      </div>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={panelStyle}
            className="animate-pop overflow-hidden rounded-xl border border-border bg-popover shadow-overlay"
          >
            <div className="flex items-center gap-2 border-b border-border/60 px-3">
              <SearchIcon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                  if (listRef.current) listRef.current.scrollTop = 0;
                }}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={
                  filtered[activeIndex] ? optionId(activeIndex) : undefined
                }
                placeholder={placeholder}
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
            </div>

            {globalSelected && (
              <p className="border-b border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Global covers every market. Remove it to choose specific countries.
              </p>
            )}

            {total === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No markets match “{query}”.
              </p>
            ) : (
              <div
                ref={listRef}
                id={listId}
                role="listbox"
                aria-multiselectable="true"
                aria-labelledby={`${listId}-label`}
                onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
                style={{ maxHeight: listMaxHeight }}
                className="overflow-y-auto overscroll-contain"
              >
                <div style={{ height: total * ROW_HEIGHT, position: 'relative' }}>
                  {windowed.map((option, index) => {
                    const realIndex = start + index;
                    const selected = values.includes(option.value);
                    const disabled = isDisabled(option);
                    return (
                      <button
                        key={option.value}
                        id={optionId(realIndex)}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        aria-disabled={disabled}
                        disabled={disabled}
                        onMouseEnter={() => setActiveIndex(realIndex)}
                        onClick={() => toggle(option.value)}
                        style={{
                          position: 'absolute',
                          top: realIndex * ROW_HEIGHT,
                          height: ROW_HEIGHT,
                        }}
                        className={cn(
                          'flex w-full items-center gap-2.5 px-3 text-left text-sm transition-colors',
                          disabled && 'cursor-not-allowed opacity-40',
                          !disabled && realIndex === activeIndex && 'bg-accent',
                          option.kind === 'region' && 'font-medium',
                        )}
                      >
                        <MarketGlyph option={option} />
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                        {selected && (
                          <span
                            className="size-4 shrink-0 rounded-full bg-primary text-primary-foreground"
                            aria-hidden="true"
                          >
                            <CheckDot />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}

      {hint !== undefined && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function MarketGlyph({ option }: { option: MarketOption }) {
  if (option.kind === 'region') {
    return (
      <Globe2Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    );
  }
  return <Flag code={option.code as string} />;
}

function Chip({ value, onRemove }: { value: string; onRemove: () => void }) {
  const option = MARKET_BY_VALUE.get(value);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 py-1 pr-1 pl-1.5 text-caption font-medium text-primary">
      {option?.kind === 'country' ? (
        <Flag code={option.code as string} />
      ) : option?.kind === 'region' ? (
        <Globe2Icon className="size-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <MapPinIcon className="size-3.5 shrink-0" aria-hidden="true" />
      )}
      {option?.label ?? value}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        className="flex size-4 items-center justify-center rounded text-primary/70 transition-colors hover:bg-primary/20 hover:text-primary"
        aria-label={`Remove ${option?.label ?? value}`}
      >
        <XIcon className="size-3" aria-hidden="true" />
      </button>
    </span>
  );
}

/** An SVG flag from `flag-icons`; renders on every platform, unlike emoji flags. */
function Flag({ code }: { code: string }) {
  return (
    <span
      className={cn('fi', `fi-${code}`, 'h-4 w-[1.35rem] shrink-0 rounded-[2px]')}
      aria-hidden="true"
    />
  );
}

function CheckDot() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <path
        d="m4.5 8.5 2.5 2.5 4.5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
