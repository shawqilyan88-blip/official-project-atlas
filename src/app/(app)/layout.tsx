import { requireTenantContext } from '@/server/session';

import { AppSidebar } from './_components/app-sidebar';
import { TopNavigation } from './_components/top-navigation';

/**
 * Never prerendered. Every page in this group is scoped to one user and one
 * tenant, so a build-time snapshot would be meaningless at best and a cache of
 * one tenant's data at worst. Declaring it explicitly also keeps the build from
 * attempting a static pass that reads request cookies.
 */
export const dynamic = 'force-dynamic';

/**
 * The protected workspace shell.
 *
 * `requireTenantContext()` is the gate for everything under `(app)`. It runs
 * server-side on every request and redirects when there is no valid session or
 * no workspace — so a page in this group can assume a resolved tenant without
 * repeating the check. The proxy performs the same redirect earlier for a
 * faster response; this is the authoritative one.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const context = await requireTenantContext();

  return (
    <div className="flex min-h-dvh">
      <AppSidebar context={context} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavigation context={context} />

        {/*
          A keyboard user should not have to tab through the whole sidebar on
          every navigation. The skip link is visually hidden until focused.
        */}
        <a
          href="#workspace-content"
          className="sr-only bg-background focus:not-sr-only focus:absolute focus:top-16 focus:left-4 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>

        <main id="workspace-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
