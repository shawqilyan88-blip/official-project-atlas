import Link from 'next/link';

import { routes } from '@/shared/config/routes';
import { site } from '@/shared/config/site';
import { Badge, Button } from '@/shared/ui';
import { ArrowRightIcon } from '@/shared/ui/icons';

import { ConversationPreview } from './_components/conversation-preview';
import { OutreachPreview } from './_components/outreach-preview';
import { PipelinePreview } from './_components/pipeline-preview';
import { PreviewCaption } from './_components/preview-frame';
import { TradeRoutesBackdrop } from './_components/trade-routes-backdrop';
import { WorkspacePreview } from './_components/workspace-preview';

/**
 * The landing page.
 *
 * Structured as a narrative rather than a feature list: find the counterparty,
 * open the conversation, keep it moving, close the deal. Each stage carries its
 * own interface preview, which replaces the earlier six-equal-cards grid — that
 * layout gave every capability identical weight and so established no hierarchy
 * at all.
 *
 * Section rhythm alternates surface treatment deliberately. Uniform
 * `border-t` + `py-24` on every section reads as a template; varying density and
 * background is what gives a long page a sense of movement.
 *
 * Written to describe what Atlas does rather than to shout about it. Buyers of
 * enterprise trade software are persuaded by specificity, not superlatives.
 */

const CAPABILITY_SECTIONS = [
  {
    id: 'conversations',
    eyebrow: 'Conversations',
    title: 'Every thread, in their language',
    body: 'Replies arrive in one shared inbox no matter which channel or time zone they came from. Atlas drafts the response and translates it both ways — then waits for you. Nothing reaches a buyer without a person approving it.',
    points: [
      'One inbox across email and messaging',
      'Drafted replies, translated in both directions',
      'Approval required before anything sends',
    ],
    preview: <ConversationPreview />,
    surface: 'muted',
  },
  {
    id: 'outreach',
    eyebrow: 'Outreach',
    title: 'Sequences that react, not just repeat',
    body: 'Each step is written from what Atlas knows about that specific company — what they import, through which port, at what volume. Follow-ups hold when someone replies, and messages land in their working morning, not yours.',
    points: [
      'Personalised from real trade signals',
      'Pauses the moment a buyer responds',
      'Sends in the recipient’s local morning',
    ],
    preview: <OutreachPreview />,
    surface: 'plain',
  },
  {
    id: 'deals',
    eyebrow: 'Deals',
    title: 'From first contact to signed contract',
    body: 'Terms, incoterms, counterparties, and documents stay attached to the deal they belong to. You always know what each opportunity is worth and how long it has been sitting.',
    points: [
      'Stages that match how trade actually closes',
      'Incoterms and documents on the deal record',
      'Value and age visible at a glance',
    ],
    preview: <PipelinePreview />,
    surface: 'muted',
  },
] as const;

const STEPS = [
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
    body: 'Atlas drafts outreach and replies. A person on your team approves them. There is no mode in which it messages a buyer on its own.',
  },
] as const;

export default function LandingPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative isolate overflow-hidden">
        <TradeRoutesBackdrop />

        <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge tone="brand" className="mb-6">
              International trade, operated by software
            </Badge>

            <h1 className="text-4xl leading-[1.06] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]">
              An entire business development department, working around the clock.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              {site.name} finds your buyers and suppliers, opens the conversations, runs
              the follow-up, and moves deals toward signature — across every market you
              trade in.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={routes.signUp}>
                  Start free
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={routes.platform}>See how it works</Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">No credit card required.</p>
          </div>

          {/* The product itself, as early as it can reasonably appear. */}
          <div className="mt-14 sm:mt-16">
            <WorkspacePreview />
            <PreviewCaption />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Discovery */}
      <section
        id="platform"
        aria-labelledby="platform-heading"
        className="border-t border-border/70"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              Discovery
            </p>
            <h2
              id="platform-heading"
              className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
            >
              Buyers you did not know existed, ranked by why they matter
            </h2>
            <p className="mt-3 leading-relaxed text-pretty text-muted-foreground">
              Atlas reads trade data continuously and surfaces companies already importing
              what you sell. Every match arrives with a verification grade and the
              specific signal that triggered it — never an unexplained score.
            </p>
          </div>

          <dl className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
            {[
              {
                term: 'Match score',
                desc: 'Product, volume, and terms fit, each shown separately so you can judge the reasoning yourself.',
              },
              {
                term: 'Verification grade',
                desc: 'Registry checks and trade history, so you know who you are talking to before you invest time.',
              },
              {
                term: 'Live signals',
                desc: 'Shipment activity, sourcing shifts, and tenders — the reason a company is worth contacting today.',
              },
            ].map((item) => (
              <div key={item.term}>
                <dt className="text-[0.9375rem] font-semibold">{item.term}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* -------------------------------------------------- Capability sections */}
      {CAPABILITY_SECTIONS.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-heading`}
          className={
            section.surface === 'muted'
              ? 'border-t border-border/70 bg-muted/30'
              : 'border-t border-border/70'
          }
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              {/* Alternating sides stop three consecutive sections from reading
                  as the same block repeated.

                  `min-w-0` is load-bearing, not decoration: grid items default
                  to `min-width: auto`, so a track refuses to shrink below its
                  content's intrinsic width. The pipeline preview is deliberately
                  wider than a phone and scrolls inside itself — without this,
                  that width propagates all the way out and the whole page
                  scrolls sideways. */}
              <div className={index % 2 === 1 ? 'min-w-0 lg:order-2' : 'min-w-0'}>
                <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                  {section.eyebrow}
                </p>
                <h2
                  id={`${section.id}-heading`}
                  className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
                >
                  {section.title}
                </h2>
                <p className="mt-4 leading-relaxed text-pretty text-muted-foreground">
                  {section.body}
                </p>

                <ul className="mt-6 space-y-2.5">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm">
                      <svg
                        viewBox="0 0 16 16"
                        className="mt-[3px] size-3.5 shrink-0 text-primary"
                        aria-hidden="true"
                      >
                        <circle cx="8" cy="8" r="7" className="fill-current opacity-15" />
                        <path
                          d="m5 8.2 2 2 4-4.4"
                          className="fill-none stroke-current"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={index % 2 === 1 ? 'min-w-0 lg:order-1' : 'min-w-0'}>
                {section.preview}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* --------------------------------------------------------- How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="border-t border-border/70"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
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

          <ol className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative">
                {/* A hairline connector on wide screens turns four cards into one
                    sequence. Hidden on the last item and on narrow layouts. */}
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-4 left-9 hidden h-px w-[calc(100%-2rem)] bg-border lg:block"
                  />
                )}
                <span
                  className="relative z-10 mb-4 flex size-8 items-center justify-center rounded-full border border-border bg-background font-mono text-sm text-muted-foreground"
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

      {/* -------------------------------------------------------------- Security */}
      <section
        id="security"
        aria-labelledby="security-heading"
        className="border-t border-border/70 bg-muted/30"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div>
              <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                Trust
              </p>
              <h2
                id="security-heading"
                className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
              >
                Built so that a mistake is not possible, not merely unlikely
              </h2>
              <p className="mt-4 leading-relaxed text-pretty text-muted-foreground">
                Your buyer list is the most valuable thing you own. Atlas is built on the
                assumption that hiding data in the interface is not the same as protecting
                it.
              </p>
            </div>

            <ul className="grid gap-6 sm:grid-cols-1">
              {SECURITY_POINTS.map((point) => (
                <li
                  key={point.title}
                  className="border-l-2 border-border/70 pl-4 sm:pl-5"
                >
                  <h3 className="text-[0.9375rem] font-semibold">{point.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {point.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ CTA */}
      <section aria-labelledby="cta-heading" className="border-t border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="cta-heading"
              className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
            >
              Start trading with a team that never sleeps
            </h2>
            <p className="mt-3 leading-relaxed text-pretty text-muted-foreground">
              Set up your workspace in a minute. Bring your team when you are ready.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={routes.signUp}>
                  Create your workspace
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href={routes.signIn}>Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
