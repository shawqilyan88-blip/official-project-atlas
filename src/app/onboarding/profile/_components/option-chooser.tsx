'use client';

import { Badge, cn } from '@/shared/ui';
import {
  ArrowRightIcon,
  FileTextIcon,
  type LucideIcon,
  SparklesIcon,
  UploadCloudIcon,
} from '@/shared/ui/icons';

/**
 * The opening choice: hand Atlas your documents, or answer a few questions.
 *
 * Both routes are given real weight — upload is recommended for speed, manual is
 * there for anyone who would rather type. The headline frames the whole flow as
 * teaching Atlas, not filling a form, which is the tone the rest of the product
 * keeps.
 */
export function OptionChooser({
  onUpload,
  onManual,
}: {
  readonly onUpload: () => void;
  readonly onManual: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl text-center">
      <Badge tone="brand" className="mb-6 border-primary/25 bg-primary/[0.07] px-3 py-1">
        <SparklesIcon className="size-3.5" aria-hidden="true" />
        Company Profile
      </Badge>

      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-[2.5rem] sm:leading-[1.1]">
        Let&rsquo;s teach Atlas about your business.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground">
        The more Atlas understands your company, the better it can discover buyers,
        suppliers, and market opportunities.
      </p>

      <div className="mt-9 grid gap-4 text-left sm:grid-cols-2">
        <OptionCard
          icon={UploadCloudIcon}
          title="Upload business documents"
          body="Company profile, catalog, brochure, LOI, or specs. Atlas extracts your products, industries, certifications, and markets automatically once analysis is live."
          meta="Recommended · fastest way to start"
          recommended
          onClick={onUpload}
        />
        <OptionCard
          icon={FileTextIcon}
          title="Fill in manually"
          body="Answer a few essential questions about what you trade and where. Only what sharpens Atlas's recommendations — nothing more."
          meta="3 quick steps"
          onClick={onManual}
        />
      </div>
    </div>
  );
}

function OptionCard({
  icon: Icon,
  title,
  body,
  meta,
  recommended = false,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  meta: string;
  recommended?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-2xl border p-6 text-left transition-all duration-[--duration-fast]',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        recommended
          ? 'border-primary/30 bg-primary/[0.04] hover:border-primary/50 hover:bg-primary/[0.07]'
          : 'border-border bg-card hover:border-border/80 hover:bg-muted/40',
      )}
    >
      {recommended && (
        <span className="absolute top-4 right-4 rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-semibold text-primary-foreground">
          Recommended
        </span>
      )}

      <span
        className={cn(
          'mb-4 flex size-11 items-center justify-center rounded-xl',
          recommended
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary/10 text-primary',
        )}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>

      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>

      <span className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{meta}</span>
        <ArrowRightIcon
          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
