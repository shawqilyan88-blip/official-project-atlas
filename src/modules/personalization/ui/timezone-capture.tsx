'use client';

import { useEffect, useRef } from 'react';

import { captureTimezoneAction } from '../actions';

/**
 * Silently teaches Atlas the browser's timezone.
 *
 * Renders nothing. On mount it compares the browser's resolved timezone with
 * what the server already knows; if they differ, it reports the real one so the
 * *next* request greets the user in their actual local time. There is no visible
 * effect and no state change — just a one-time, fire-and-forget report — so it
 * adds no flash and no hydration work.
 *
 * The greeting on this very first visit may use the default timezone; that is an
 * accepted trade for never blocking render on a round trip. From the second
 * visit onward it is correct.
 */
export function TimezoneCapture({ known }: { known: string }) {
  const reported = useRef(false);

  useEffect(() => {
    if (reported.current) return;
    reported.current = true;

    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimezone && browserTimezone !== known) {
      // Fire and forget: the cookie it sets is read on the next request.
      void captureTimezoneAction(browserTimezone);
    }
  }, [known]);

  return null;
}
