'use client';

import { type CSSProperties, type RefObject, useEffect, useState } from 'react';

/**
 * Positions a portaled dropdown panel against its trigger.
 *
 * The panel renders into `document.body` so no ancestor `overflow` can clip it,
 * which means it must be positioned manually. This measures the trigger and
 * returns a `position: fixed` style plus an adaptive `listMaxHeight`:
 *
 * - It opens below the trigger, or flips above when there is more room there.
 * - The option list shrinks to the space available, so the whole panel is
 *   always fully on screen — at the top, the bottom, or on a short mobile
 *   viewport.
 * - The final top is clamped to the viewport, so even a stale measurement can
 *   never place the panel off screen.
 * - It follows scroll and resize while open.
 */
export interface AnchoredPanel {
  readonly style: CSSProperties;
  readonly listMaxHeight: number;
}

const GAP = 4;
const MARGIN = 8;
const SEARCH_ROW = 48;
const MIN_LIST = 140;

export function useAnchoredPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  defaultListHeight: number,
): AnchoredPanel {
  const [panel, setPanel] = useState<AnchoredPanel>({
    style: { position: 'fixed', visibility: 'hidden' },
    listMaxHeight: defaultListHeight,
  });

  useEffect(() => {
    if (!open) return;

    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      const spaceBelow = vh - rect.bottom - MARGIN;
      const spaceAbove = rect.top - MARGIN;
      const openUp =
        spaceBelow < defaultListHeight + SEARCH_ROW && spaceAbove > spaceBelow;
      const available = Math.max(openUp ? spaceAbove : spaceBelow, MIN_LIST + SEARCH_ROW);

      const listMaxHeight = Math.max(
        MIN_LIST,
        Math.min(defaultListHeight, available - SEARCH_ROW - GAP),
      );
      const panelHeight = listMaxHeight + SEARCH_ROW;

      const rawTop = openUp ? rect.top - GAP - panelHeight : rect.bottom + GAP;
      // Clamp into the viewport so a stale/off-screen measurement can't hide it.
      const top = Math.min(
        Math.max(MARGIN, rawTop),
        Math.max(MARGIN, vh - panelHeight - MARGIN),
      );

      setPanel({
        style: {
          position: 'fixed',
          top: Math.round(top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          zIndex: 60,
        },
        listMaxHeight: Math.round(listMaxHeight),
      });
    };

    update();
    // Capture phase catches scrolls on any ancestor, not just the window.
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, triggerRef, defaultListHeight]);

  return panel;
}
