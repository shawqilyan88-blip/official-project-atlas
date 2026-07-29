import Link from 'next/link';

import { routes } from '@/shared/config/routes';
import { site } from '@/shared/config/site';
import { Badge, Button, cn } from '@/shared/ui';
import {
  ArrowRightIcon,
  BriefcaseIcon,
  BuildingIcon,
  type LucideIcon,
  MessagesSquareIcon,
  SendIcon,
  UsersIcon,
} from '@/shared/ui/icons';

import { HeroBackdrop } from './_components/hero-backdrop';

/**
 * The landing page.
 *
 * Rebuilt around a typographic hero. There is deliberately no product mockup:
 * a screenshot of software that does not exist yet is a fake dashboard, and it
 * was creating more problems than it solved — the empty band beneath it, the
 * question of what was real. The hero now earns its impact from type and light
 * alone, the way Vercel and Linear open, and the capabilities are shown as an
 * honest feature grid rather than an invented interface.
 *
 * Written to describe what Atlas does, not to shout about it. Buyers of
 * enterprise trade software are moved by specificity, not superlatives.
 */

interface Capability {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly body: string;
  /** Featured cells span two columns and carry the primary tint. */
  readonly featured?: boolean;
}

const CAPABILITIES: readonly Capability[] = [
  {
    icon: UsersIcon,
    title: 'Find the buyers and suppliers that fit',
    body: 'Atlas reads global trade data continuously and surfaces verified buyers importing what you sell and reliable suppliers for what you source — each ranked by fit and shown with the specific reason it matters today, never an unexplained score.',
    featured: true,
  },
  {
    icon: BuildingIcon,
    title: 'Vetted on real trade, not pay-to-play',
    body: 'Buyers and suppliers alike are qualified on capability, certification, and delivered reliability — surfaced because the trade data earns it, never because someone paid for placement.',
  },
  {
    icon: MessagesSquareIcon,
    title: 'Every conversation in one place',
    body: 'Threads from every channel and time zone in one shared inbox. Atlas drafts the reply; a person approves it before it sends.',
  },
  {
    icon: SendIcon,
    title: 'Outreach that reacts',
    body: 'Sequences written from what each company actually trades. Follow-ups pause the moment a buyer or supplier replies, and send in their working morning.',
  },
  {
    icon: BriefcaseIcon,
    title: 'Close with everything in one record',
    body: 'Terms, incoterms, counterparties, and documents stay attached to the deal, from first contact to signature.',
  },
];

const STEPS = [
  {
    title: 'Tell Atlas about your business',
    description:
      "What do you trade — or want to trade? Share your products, markets, and whether you're looking for buyers, suppliers, or both.",
  },
  {
    title: 'Atlas finds buyers and suppliers',
    description:
      'It analyzes global trade data continuously to discover qualified buyers and reliable suppliers that match your business.',
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
] as const;

const SECURITY_POINTS = [
  {
    title: 'Isolation enforced by the database',
    body: 'Every record belongs to exactly one workspace, and that boundary is enforced by Postgres row-level security — not by application code that could be bypassed.',
  },
  {
    title: 'Roles that actually restrict',
    body: 'Owner, admin, and member permissions are checked in the database on every query. Nobody can grant themselves a role above their own.',
  },
  {
    title: 'Nothing sends without approval',
    body: 'Atlas drafts outreach and replies. A person on your team approves them. There is no mode in which it messages a buyer or supplier on its own.',
  },
] as const;

export default function LandingPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero
          A single full-height screen. The content is one centred column on the
          aurora, so the gradient fills the frame and the composition has no
          dead space to leave — there is no second element to strand. `svh`
          keeps mobile browser chrome from cropping it. */}
      <section className="relative isolate flex min-h-[calc(100svh-5.5rem)] items-center overflow-hidden">
        <HeroBackdrop />

        <div className="mx-auto w-full max-w-[85rem] px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge
              tone="brand"
              className="mb-7 border-primary/25 bg-primary/[0.07] px-3 py-1 backdrop-blur-sm"
            >
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-primary" />
              The AI operating system for international trade
            </Badge>

            {/* Leading at 1.08 with `pb` on the gradient line: `bg-clip-text`
                paints only the line box, so a tight leading clips descenders.
                This gives them room. */}
            <h1 className="text-[2.75rem] leading-[1.08] font-semibold tracking-[-0.038em] text-balance sm:text-[4rem] lg:text-[4.75rem]">
              Trade with the world.
              <span className="block bg-gradient-to-br from-headline-from to-headline-to bg-clip-text pb-[0.1em] text-transparent">
                Without the guesswork.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground sm:mt-7 sm:text-xl">
              {site.name} finds verified buyers and suppliers, opens the conversations,
              runs the follow-up, and moves deals toward signature — in every market you
              trade in.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="h-12 w-full px-8 text-[0.9375rem] shadow-lg shadow-primary/25 sm:w-auto"
              >
                <Link href={routes.signUp}>
                  Start free
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 w-full border-border/80 bg-background/50 px-8 text-[0.9375rem] backdrop-blur-sm sm:w-auto"
              >
                <Link href={routes.howItWorks}>See how it works</Link>
              </Button>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              No credit card required · Set up in under a minute
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Capabilities
          A bento grid rather than equal cards. The featured cell spans two
          columns and carries the brand tint, so the grid has a focal point and
          a reading order instead of six identical tiles. No invented interface —
          each cell states what the product does, in words. */}
      <section
        id="capabilities"
        aria-labelledby="capabilities-heading"
        className="relative border-t border-border/60"
      >
        <div className="mx-auto w-full max-w-[85rem] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              The platform
            </p>
            <h2
              id="capabilities-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              Everything a trade team does, in one system
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
              Most teams run this on spreadsheets, a shared inbox, and memory. Atlas
              replaces all three with something that keeps working when nobody is
              watching.
            </p>
          </div>

          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((capability) => (
              <CapabilityCard key={capability.title} capability={capability} />
            ))}
          </ul>
        </div>
      </section>

      {/* --------------------------------------------------------- How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="relative border-t border-border/60 bg-muted/30"
      >
        <div className="mx-auto w-full max-w-[85rem] px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              How it works
            </p>
            <h2
              id="how-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              Four steps, and the middle two run without you
            </h2>
          </div>

          <ol className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative">
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-5 left-11 hidden h-px w-[calc(100%-2.5rem)] bg-border lg:block"
                  />
                )}
                <span
                  className="relative z-10 mb-5 flex size-10 items-center justify-center rounded-full border border-border bg-background font-mono text-sm text-muted-foreground"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------------------------------------- Security */}
      <section
        id="security"
        aria-labelledby="security-heading"
        className="relative border-t border-border/60"
      >
        <div className="mx-auto w-full max-w-[85rem] px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                Trust
              </p>
              <h2
                id="security-heading"
                className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
              >
                Built so a mistake is not possible, not merely unlikely
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
                Your trade network — every buyer and supplier you have found — is the most
                valuable thing you own. Atlas is built on the assumption that hiding data
                in the interface is not the same as protecting it.
              </p>
            </div>

            <ul className="grid gap-6">
              {SECURITY_POINTS.map((point) => (
                <li key={point.title} className="border-l-2 border-primary/40 pl-5">
                  <h3 className="text-base font-semibold">{point.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted-foreground">
                    {point.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ CTA */}
      <section
        aria-labelledby="cta-heading"
        className="relative border-t border-border/60"
      >
        <div className="mx-auto w-full max-w-[85rem] px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="cta-heading"
              className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              Start trading with a team that never sleeps
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
              Set up your workspace in a minute. Bring your team when you are ready.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="h-12 px-8 shadow-lg shadow-primary/25">
                <Link href={routes.signUp}>
                  Create your workspace
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild className="h-12 px-8">
                <Link href={routes.signIn}>Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function CapabilityCard({ capability }: { capability: Capability }) {
  const Icon = capability.icon;

  return (
    <li
      className={cn(
        'group relative flex flex-col rounded-2xl border p-7 transition-colors',
        capability.featured
          ? 'border-primary/20 bg-primary/[0.04] hover:bg-primary/[0.06] sm:col-span-2'
          : 'border-border bg-card hover:bg-muted/40',
      )}
    >
      <span
        className={cn(
          'mb-5 flex size-11 items-center justify-center rounded-xl',
          capability.featured
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary/10 text-primary',
        )}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>

      <h3
        className={cn(
          'font-semibold',
          capability.featured ? 'text-xl sm:max-w-md' : 'text-base',
        )}
      >
        {capability.title}
      </h3>
      <p
        className={cn(
          'mt-2 leading-relaxed text-muted-foreground',
          capability.featured ? 'text-base sm:max-w-lg' : 'text-sm',
        )}
      >
        {capability.body}
      </p>
    </li>
  );
}
