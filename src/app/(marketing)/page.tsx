import Link from 'next/link';

import {
  ArrowRightIcon,
  BriefcaseIcon,
  BuildingIcon,
  type LucideIcon,
  MessagesSquareIcon,
  SendIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@/shared/ui/icons';

import { routes } from '@/shared/config/routes';
import { site } from '@/shared/config/site';
import { Badge, Button, Card, CardContent } from '@/shared/ui';

/**
 * The landing page.
 *
 * Written to describe what Atlas does rather than to shout about it. The
 * restraint is the positioning: buyers of enterprise trade software are
 * persuaded by specificity, not by superlatives.
 */

const CAPABILITIES: readonly {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: UsersIcon,
    title: 'Find buyers',
    description:
      'Surface companies already importing what you sell, with the trade signals that show they are actively purchasing.',
  },
  {
    icon: BuildingIcon,
    title: 'Find suppliers',
    description:
      'Identify and vet manufacturers by capability, certification, and delivered reliability — not by who paid for placement.',
  },
  {
    icon: MessagesSquareIcon,
    title: 'Manage conversations',
    description:
      'Every thread, across every channel and time zone, in one place your whole team can see.',
  },
  {
    icon: SendIcon,
    title: 'Automate outreach',
    description:
      'Sequences that adapt to how each contact replies, in their language, at a sensible hour where they live.',
  },
  {
    icon: BriefcaseIcon,
    title: 'Negotiate and close',
    description:
      'Track terms, incoterms, and counterparties from first contact to signed contract without leaving the workspace.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Built for teams',
    description:
      'Roles, permissions, and tenant isolation enforced in the database — not merely hidden in the interface.',
  },
];

const STEPS: readonly { title: string; description: string }[] = [
  {
    title: 'Describe what you trade',
    description:
      'Products, markets, capacity, and the terms you can offer. Atlas builds its search from your actual business.',
  },
  {
    title: 'Atlas finds the counterparties',
    description:
      'It works through trade data continuously, ranking prospects by fit and by how likely they are to buy now.',
  },
  {
    title: 'Conversations begin',
    description:
      'Outreach goes out, replies arrive in your inbox, and the promising ones are escalated to you.',
  },
  {
    title: 'You close the deal',
    description:
      'Atlas handles the follow-ups, the scheduling, and the paperwork trail. You make the decisions.',
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        {/* Depth without decoration: a soft brand wash and a faint grid. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-b from-primary/[0.08] via-transparent to-transparent"
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge tone="brand" className="mb-6">
              International trade, operated by software
            </Badge>

            <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              An entire business development department, working around the clock.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {site.name} finds your buyers and suppliers, opens the conversations, runs
              the follow-up, and moves deals toward signature — across every market you
              trade in.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={routes.signUp}>
                  Start free
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={routes.platform}>See what it does</Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">No credit card required.</p>
          </div>
        </div>
      </section>

      <section
        id="platform"
        aria-labelledby="platform-heading"
        className="border-t border-border/70"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <h2
              id="platform-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Everything a trade team does, in one system
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Most teams run this on spreadsheets, a shared inbox, and memory. Atlas
              replaces all three with something that keeps working when nobody is
              watching.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map(({ icon: Icon, title, description }) => (
              <li key={title}>
                <Card className="h-full transition-shadow duration-200 hover:shadow-raised">
                  <CardContent className="p-6 pt-6">
                    <span
                      className="mb-4 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
                      aria-hidden="true"
                    >
                      <Icon className="size-[1.125rem]" />
                    </span>
                    <h3 className="text-[0.9375rem] font-semibold">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="pricing"
        aria-labelledby="how-heading"
        className="border-t border-border/70 bg-muted/30"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <h2
              id="how-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              How it works
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Four steps, and the middle two run without you.
            </p>
          </div>

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative">
                <span
                  className="mb-4 flex size-8 items-center justify-center rounded-full border border-border font-mono text-sm text-muted-foreground"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <h3 className="text-[0.9375rem] font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="cta-heading" className="border-t border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="cta-heading"
              className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
            >
              Start trading with a team that never sleeps
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Set up your workspace in a minute. Bring your team when you are ready.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href={routes.signUp}>
                  Create your workspace
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
