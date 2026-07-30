'use client';

import { type CSSProperties, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { InfoIcon } from './icons';
import { cn } from './utils/cn';

/**
 * A small educational tooltip for advanced fields (Incoterms, MOQ, payment
 * terms…). The trigger is a real focusable button, so the explanation is
 * reachable by keyboard and screen readers, not just on hover.
 *
 * The bubble is portaled to `document.body` and positioned `fixed`, so it
 * escapes the `overflow-hidden` on collapsible sections that would otherwise
 * clip it. It opens above the trigger and flips below when there isn't room.
 */
const WIDTH = 240;
const GAP = 8;
const MARGIN = 8;

export function InfoTooltip({
  label,
  children,
}: {
  readonly label: string;
  readonly children: string;
}) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({
    position: 'fixed',
    visibility: 'hidden',
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;

    const place = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const flipBelow = r.top < 96; // not enough room above
      const left = Math.min(
        Math.max(MARGIN, r.left + r.width / 2 - WIDTH / 2),
        vw - WIDTH - MARGIN,
      );
      setStyle({
        position: 'fixed',
        left: Math.round(left),
        width: WIDTH,
        zIndex: 70,
        ...(flipBelow
          ? { top: Math.round(r.bottom + GAP) }
          : { bottom: Math.round(window.innerHeight - r.top + GAP) }),
      });
    };

    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`About ${label}`}
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={cn(
          'focus-ring inline-flex size-4 shrink-0 items-center justify-center rounded-full align-middle text-muted-foreground/70 transition-colors',
          'hover:text-foreground focus-visible:text-foreground',
        )}
      >
        <InfoIcon className="size-3.5" aria-hidden="true" />
      </button>

      {open &&
        createPortal(
          <span
            role="tooltip"
            id={tipId}
            style={style}
            className="animate-pop pointer-events-none block rounded-lg border border-border bg-popover px-3 py-2 text-xs leading-relaxed text-popover-foreground shadow-overlay"
          >
            {children}
          </span>,
          document.body,
        )}
    </>
  );
}
