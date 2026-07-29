'use client';

import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { SelectOption } from '@/shared/data/business';

import { ChevronsUpDownIcon, PlusIcon, SearchIcon, XIcon } from './icons';
import { InfoTooltip } from './info-tooltip';
import { OptionalBadge, type OptionalLevel } from './optional-badge';
import { useAnchoredPosition } from './use-anchored-position';
import { cn } from './utils/cn';

/**
 * A searchable single- or multi-select over a fixed option list.
 *
 * The generic sibling of `MarketSelect`: same combobox mechanics (arrow keys,
 * Enter, Escape, windowed list) for any closed vocabulary — business type,
 * industry, Incoterms, certifications, and so on. `allowCustom` adds an
 * "Add …" row so a fixed list can still capture the long tail ("Other…").
 * Single-select replaces and closes; multi-select toggles chips.
 */
interface RenderOption {
  readonly value: string;
  readonly label: string;
  readonly custom?: boolean;
}

const ROW_HEIGHT = 40;
const VIEWPORT_HEIGHT = 264;
const OVERSCAN = 6;

export function SearchableSelect({
  label,
  optional,
  hint,
  info,
  options,
  values,
  onChange,
  multiple = true,
  allowCustom = false,
  placeholder = 'Search…',
}: {
  readonly label: string;
  readonly optional?: OptionalLevel;
  readonly hint?: string;
  readonly info?: string;
  readonly options: readonly SelectOption[];
  readonly values: readonly string[];
  readonly onChange: (values: readonly string[]) => void;
  readonly multiple?: boolean;
  readonly allowCustom?: boolean;
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

  const labelOf = useMemo(() => {
    const map = new Map(options.map((option) => [option.value, option.label]));
    return (value: string) => map.get(value) ?? value;
  }, [options]);

  const filtered = useMemo<RenderOption[]>(() => {
    const needle = query.trim().toLowerCase();
    const base: RenderOption[] =
      needle.length === 0
        ? options.map((option) => ({ value: option.value, label: option.label }))
        : options
            .filter((option) =>
              `${option.label} ${option.value} ${option.keywords ?? ''}`
                .toLowerCase()
                .includes(needle),
            )
            .map((option) => ({ value: option.value, label: option.label }));

    const exact = options.some((option) => option.value.toLowerCase() === needle);
    const already = values.some((value) => value.toLowerCase() === needle);
    if (allowCustom && needle.length > 0 && !exact && !already) {
      return [
        { value: query.trim(), label: `Add “${query.trim()}”`, custom: true },
        ...base,
      ];
    }
    return base;
  }, [query, options, allowCustom, values]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      // The panel is portaled to <body>, so it is outside containerRef — check
      // it separately or a click inside the open dropdown would close it.
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

  const select = (option: RenderOption) => {
    if (!multiple) {
      onChange([option.value]);
      setOpen(false);
      return;
    }
    const has = values.includes(option.value);
    onChange(
      has ? values.filter((value) => value !== option.value) : [...values, option.value],
    );
    if (option.custom) {
      setQuery('');
      setActiveIndex(0);
    }
  };

  const remove = (value: string) => onChange(values.filter((entry) => entry !== value));

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
      if (option) select(option);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Backspace' && query.length === 0 && values.length > 0) {
      remove(values[values.length - 1] as string);
    }
  };

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
        {info !== undefined && (
          <span className="ml-1.5">
            <InfoTooltip label={label}>{info}</InfoTooltip>
          </span>
        )}
      </label>

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
          <span
            key={value}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 py-1 pr-1 pl-2 text-[0.8125rem] font-medium text-primary"
          >
            {labelOf(value)}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                remove(value);
              }}
              className="flex size-4 items-center justify-center rounded text-primary/70 transition-colors hover:bg-primary/20 hover:text-primary"
              aria-label={`Remove ${labelOf(value)}`}
            >
              <XIcon className="size-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        {values.length === 0 && (
          <span className="px-1 text-sm text-muted-foreground/70">{placeholder}</span>
        )}
        <ChevronsUpDownIcon
          className="ml-auto size-4 shrink-0 text-muted-foreground/60"
          aria-hidden="true"
        />
      </div>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={panelStyle}
            className="animate-pop overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
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

            {total === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No matches for “{query}”.
              </p>
            ) : (
              <div
                ref={listRef}
                id={listId}
                role="listbox"
                aria-multiselectable={multiple}
                aria-labelledby={`${listId}-label`}
                onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
                style={{ maxHeight: listMaxHeight }}
                className="overflow-y-auto overscroll-contain"
              >
                <div style={{ height: total * ROW_HEIGHT, position: 'relative' }}>
                  {windowed.map((option, index) => {
                    const realIndex = start + index;
                    const selected = values.includes(option.value);
                    return (
                      <button
                        key={`${option.value}-${option.custom ? 'c' : 'o'}`}
                        id={optionId(realIndex)}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onMouseEnter={() => setActiveIndex(realIndex)}
                        onClick={() => select(option)}
                        style={{
                          position: 'absolute',
                          top: realIndex * ROW_HEIGHT,
                          height: ROW_HEIGHT,
                        }}
                        className={cn(
                          'flex w-full items-center gap-2.5 px-3 text-left text-sm transition-colors',
                          realIndex === activeIndex && 'bg-accent',
                        )}
                      >
                        {option.custom && (
                          <PlusIcon
                            className="size-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                        )}
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                        {selected && (
                          <span
                            className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                            aria-hidden="true"
                          >
                            <svg viewBox="0 0 16 16" className="size-4">
                              <path
                                d="m4.5 8.5 2.5 2.5 4.5-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
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
