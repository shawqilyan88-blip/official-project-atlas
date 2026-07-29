import Link from 'next/link';

import { routes } from '@/shared/config/routes';
import { site } from '@/shared/config/site';
import { LogoMark, Wordmark } from '@/shared/ui';

import { SiteHeader } from './_components/site-header';

/**
 * Marketing shell.
 *
 * The footer links only to destinations that actually exist. Privacy, terms,
 * and company pages are conspicuous by their absence — a production site needs
 * them, but linking to routes that 404 is worse than not linking at all, and
 * inventing the pages would mean writing legal text nobody has approved.
 *
 * Container width and gutters match `SiteHeader` and the hero exactly
 * (`max-w-[85rem]`, `px-5 sm:px-8`). Mismatched gutters between header, body,
 * and footer produce a left edge that shifts as you scroll — subtle enough that
 * most people cannot name it, and one of the reliable signals of an unfinished
 * page.
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
        className="sr-only bg-background focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-md focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto w-full max-w-[85rem] px-5 py-16 sm:px-8">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
            <div className="max-w-xs">
              <Wordmark size="md" />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {site.tagline}
              </p>
            </div>

            {FOOTER_SECTIONS.map((section) => (
              <nav key={section.heading} aria-label={section.heading}>
                <h2 className="text-[0.6875rem] font-semibold tracking-wider uppercase">
                  {section.heading}
                </h2>
                <ul className="mt-4 space-y-2.5">
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

          <div className="mt-14 flex flex-col gap-3 border-t border-border/60 pt-8 sm:flex-row sm:items-center sm:justify-between">
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
