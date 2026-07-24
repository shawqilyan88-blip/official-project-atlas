import Link from 'next/link';

import { routes } from '@/shared/config/routes';
import { site } from '@/shared/config/site';
import { ThemeToggle, Wordmark } from '@/shared/ui';

/**
 * The authentication shell.
 *
 * A single centred column with nothing else on screen. Every element removed
 * here is one fewer thing between a returning user and their work.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* A restrained wash of brand colour, so the page is not a blank sheet. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/[0.07] to-transparent"
      />

      <header className="relative flex h-16 items-center justify-between px-4 sm:px-6">
        <Link
          href={routes.home}
          className="rounded-md focus-visible:outline-none"
          aria-label={`${site.name} home`}
        >
          <Wordmark />
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[25rem]">{children}</div>
      </main>
    </div>
  );
}
