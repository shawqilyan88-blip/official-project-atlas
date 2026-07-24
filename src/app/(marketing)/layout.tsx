import Link from 'next/link';

import { routes } from '@/shared/config/routes';
import { site } from '@/shared/config/site';
import { Button, LogoMark, ThemeToggle, Wordmark } from '@/shared/ui';

/**
 * Marketing shell.
 *
 * The footer links only to destinations that actually exist. Privacy, terms,
 * and company pages are conspicuous by their absence — a production site needs
 * them, but linking to routes that 404 is worse than not linking at all, and
 * inventing the pages would mean writing legal text nobody has approved.
 */
const FOOTER_SECTIONS = [
  {
    heading: 'Product',
    links: [
      { label: 'Discovery', href: routes.platform },
      { label: 'Conversations', href: '/#conversations' },
      { label: 'Outreach', href: '/#outreach' },
      { label: 'Deals', href: '/#deals' },
    ],
  },
  {
    heading: 'Learn',
    links: [
      { label: 'How it works', href: routes.howItWorks },
      { label: 'Security', href: routes.security },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign in', href: routes.signIn },
      { label: 'Create workspace', href: routes.signUp },
    ],
  },
] as const;

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only bg-background focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link
            href={routes.home}
            className="shrink-0 rounded-md focus-visible:outline-none"
            aria-label={`${site.name} home`}
          >
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden flex-1 items-center gap-6 md:flex">
            <Link
              href={routes.platform}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Platform
            </Link>
            <Link
              href={routes.howItWorks}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </Link>
            <Link
              href={routes.security}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Security
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href={routes.signIn}>Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={routes.signUp}>Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
            <div className="max-w-xs">
              <Wordmark />
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {site.tagline}
              </p>
            </div>

            {FOOTER_SECTIONS.map((section) => (
              <nav key={section.heading} aria-label={section.heading}>
                <h2 className="text-[0.6875rem] font-semibold tracking-wider uppercase">
                  {section.heading}
                </h2>
                <ul className="mt-3 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {site.legalName}. All rights reserved.
            </p>
            <LogoMark className="size-5 text-muted-foreground/40" />
          </div>
        </div>
      </footer>
    </div>
  );
}
