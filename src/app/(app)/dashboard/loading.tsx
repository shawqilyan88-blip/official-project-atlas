/**
 * The dashboard loading state.
 *
 * Next.js shows this instantly while the server resolves the tenant context and
 * personalization. It mirrors the real layout's shape — greeting, command
 * centre, two-column body — so the page settles into place rather than jumping,
 * and it shimmers rather than sitting inert, which reads as "working" instead of
 * "stuck". The shimmer stills under `prefers-reduced-motion`.
 */
function Bar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-md bg-muted/60 ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading your workspace">
      {/* Greeting */}
      <div className="space-y-2.5">
        <Bar className="h-3 w-28" />
        <Bar className="h-7 w-72 max-w-full" />
        <Bar className="h-4 w-96 max-w-full" />
      </div>

      {/* Command centre */}
      <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <Bar className="size-9 rounded-full" />
          <Bar className="h-4 w-24" />
        </div>
        <Bar className="mb-5 h-6 w-64 max-w-full" />
        <Bar className="h-14 w-full rounded-2xl" />
        <div className="mt-3 flex gap-2">
          <Bar className="h-7 w-48 rounded-full" />
          <Bar className="h-7 w-40 rounded-full" />
        </div>
      </div>

      {/* Business pulse */}
      <div>
        <Bar className="mb-3 h-4 w-32" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((card) => (
            <div key={card} className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <Bar className="size-8 rounded-lg" />
                <Bar className="h-4 w-10 rounded-full" />
              </div>
              <Bar className="mb-2 h-3 w-16" />
              <Bar className="mb-2 h-6 w-12" />
              <Bar className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Today's briefing */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex gap-3">
          <Bar className="size-8 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Bar className="h-4 w-28" />
            <Bar className="h-4 w-80 max-w-full" />
          </div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {[0, 1].map((col) => (
            <div key={col} className="space-y-2.5">
              <Bar className="mb-3 h-3 w-20" />
              {[0, 1, 2].map((row) => (
                <Bar key={row} className="h-3.5 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-5 lg:col-span-2">
          <Bar className="mb-5 h-4 w-40" />
          <div className="space-y-4">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex gap-3.5">
                <Bar className="size-9 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2 py-1">
                  <Bar className="h-3.5 w-3/4" />
                  <Bar className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <Bar className="mb-4 h-4 w-28" />
            <div className="space-y-3">
              {[0, 1, 2, 3].map((row) => (
                <Bar key={row} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <Bar className="mb-4 h-4 w-24" />
            <div className="space-y-3">
              {[0, 1, 2].map((row) => (
                <Bar key={row} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
