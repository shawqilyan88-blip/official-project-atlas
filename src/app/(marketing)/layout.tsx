import Link from 'next/link';

import { routes } from '@/shared/config/routes';
import { site } from '@/shared/config/site';
import { Button, ThemeToggle, Wordmark } from '@/shared/ui';

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
            className="rounded-md focus-visible:outline-none"
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
              href={routes.pricing}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
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
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <Wordmark />
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
