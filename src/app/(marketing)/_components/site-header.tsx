'use client';

import Link from 'next/link';
import { useState } from 'react';

import { routes } from '@/shared/config/routes';
import { site } from '@/shared/config/site';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetTrigger,
  ThemeToggle,
  Wordmark,
  cn,
} from '@/shared/ui';
import { MenuIcon } from '@/shared/ui/icons';

/**
 * The marketing header.
 *
 * Three regions on one row: the logo pinned left, the navigation centred in the
 * space *between* the logo and the actions, and the actions pinned right. The
 * nav uses `flex-1 justify-center`, so it centres between its neighbours rather
 * than on the viewport — the layout the brief asks for.
 *
 * The appearance toggle lives here, not in the footer. A full-viewport hero
 * means the footer is an entire scroll away, so a toggle placed there is
 * effectively unreachable on first load — which reads as "the theme control is
 * missing". In the header it is always in reach, next to sign-in.
 *
 * Menu items are marked `soon` where the destination does not exist yet; they
 * render inert with a quiet tag rather than as links that 404, matching how the
 * product sidebar handles unbuilt modules (docs/DECISIONS.md, ADR-014).
 */
interface MenuItem {
  readonly label: string;
  readonly description: string;
  readonly href?: string;
}

interface NavEntry {
  readonly label: string;
  readonly items: readonly MenuItem[];
}

const NAVIGATION: readonly NavEntry[] = [
  {
    label: 'Platform',
    items: [
      {
        label: 'Discovery',
        description: 'Find verified buyers and suppliers',
        href: routes.platform,
      },
      {
        label: 'Conversations',
        description: 'Every thread in one shared inbox',
        href: '/#capabilities',
      },
      {
        label: 'Outreach',
        description: 'Sequences that react to replies',
        href: '/#capabilities',
      },
      {
        label: 'Deals',
        description: 'From first contact to contract',
        href: '/#capabilities',
      },
    ],
  },
  {
    label: 'Solutions',
    items: [
      { label: 'For exporters', description: 'Open new markets' },
      { label: 'For importers', description: 'Diversify your supply base' },
      { label: 'For trading houses', description: 'Run both sides of the book' },
    ],
  },
  {
    label: 'Resources',
    items: [
      {
        label: 'How it works',
        description: 'Four steps, two of them automatic',
        href: routes.howItWorks,
      },
      { label: 'Documentation', description: 'Guides and API reference' },
      { label: 'Trade glossary', description: 'Incoterms, tariffs, and terms' },
    ],
  },
  {
    label: 'Pricing',
    items: [
      { label: 'Plans', description: 'Compare what each tier includes' },
      { label: 'Talk to sales', description: 'Volume and enterprise terms' },
    ],
  },
  {
    label: 'Customers',
    items: [
      { label: 'Case studies', description: 'How teams trade with Atlas' },
      { label: 'Customer stories', description: 'In their own words' },
    ],
  },
  {
    label: 'Company',
    items: [
      {
        label: 'Security',
        description: 'How your data is isolated',
        href: routes.security,
      },
      { label: 'About', description: 'Why we are building Atlas' },
      { label: 'Careers', description: 'Join the team' },
    ],
  },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[5.5rem] w-full max-w-[85rem] items-center gap-6 px-5 sm:px-8">
        <Link
          href={routes.home}
          className="shrink-0 rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none"
          aria-label={`${site.name} home`}
        >
          <Wordmark size="xl" />
        </Link>

        {/* flex-1 + justify-center centres the nav in the gap between the logo
            and the actions, which is what "centred between the logo and the
            buttons" means. */}
        <nav aria-label="Primary" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-0.5">
            {NAVIGATION.map((entry) => (
              <li key={entry.label}>
                <NavigationMenu entry={entry} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href={routes.signIn}>Sign in</Link>
          </Button>
          <Button size="sm" asChild className="shadow-sm">
            <Link href={routes.signUp}>Get started</Link>
          </Button>
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}

function NavigationMenu({ entry }: { entry: NavEntry }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'group inline-flex items-center gap-1 rounded-lg px-2.5 py-2 xl:px-3',
          'text-[0.8125rem] font-medium whitespace-nowrap text-muted-foreground',
          'transition-colors duration-[--duration-fast]',
          'hover:bg-muted/60 hover:text-foreground',
          'data-[state=open]:bg-muted/60 data-[state=open]:text-foreground',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        )}
      >
        {entry.label}
        <svg
          viewBox="0 0 16 16"
          className="size-3 opacity-50 transition-transform duration-[--duration-fast] group-data-[state=open]:rotate-180"
          aria-hidden="true"
        >
          <path
            d="m4 6.25 4 4 4-4"
            className="fill-none stroke-current"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[19rem] p-1.5">
        <ul>
          {entry.items.map((item) => (
            <li key={item.label}>
              {item.href === undefined ? (
                <span
                  className="flex items-start justify-between gap-3 rounded-md px-2.5 py-2 opacity-60"
                  aria-disabled="true"
                >
                  <span className="min-w-0">
                    <span className="block text-[0.8125rem] font-medium">
                      {item.label}
                    </span>
                    <span className="block text-xs leading-snug text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <span className="mt-px shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
                    Soon
                  </span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'block rounded-md px-2.5 py-2 transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:bg-accent focus-visible:outline-none',
                  )}
                >
                  <span className="block text-[0.8125rem] font-medium">{item.label}</span>
                  <span className="block text-xs leading-snug text-muted-foreground">
                    {item.description}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <MenuIcon className="size-5" aria-hidden="true" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        title="Site navigation"
        description="Browse the Atlas platform, solutions, and company pages."
        className="w-[19rem] overflow-y-auto bg-background p-0"
      >
        <div className="flex h-[5.5rem] shrink-0 items-center px-5">
          <Wordmark size="lg" />
        </div>

        <nav aria-label="Mobile" className="px-3 pb-8">
          {NAVIGATION.map((entry) => (
            <section key={entry.label} className="py-2">
              <h2 className="px-2 pb-1 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
                {entry.label}
              </h2>
              <ul>
                {entry.items.map((item) => (
                  <li key={item.label}>
                    {item.href === undefined ? (
                      <span
                        className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm opacity-60"
                        aria-disabled="true"
                      >
                        {item.label}
                        <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
                          Soon
                        </span>
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div className="mt-4 border-t border-border pt-4 sm:hidden">
            <Button variant="outline" asChild block>
              <Link href={routes.signIn} onClick={() => setOpen(false)}>
                Sign in
              </Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
