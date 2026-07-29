'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { OpportunityCompany } from '@/modules/trade-opportunity/domain/opportunity-company';
import {
  type ConversationMessage,
  MESSAGE_STATUS_LABEL,
  type MessageStatus,
} from '@/modules/trade-opportunity/domain/outreach';
import {
  approveDraftAction,
  draftMessageAction,
  editDraftAction,
  regenerateDraftAction,
  sendMessageAction,
} from '@/modules/trade-opportunity/outreach-actions';
import { idleState } from '@/shared/lib/action-state';
import { Alert, Button, cn } from '@/shared/ui';
import {
  BuildingIcon,
  CheckIcon,
  Loader2Icon,
  MessagesSquareIcon,
  RefreshCwIcon,
  SendIcon,
  SparklesIcon,
} from '@/shared/ui/icons';

/**
 * The Conversations tab — human-approved outreach.
 *
 * Atlas drafts; you edit, approve, and send. Approval and sending are separate
 * server actions, and the server refuses to send anything that is not in an
 * `approved` state — the buttons here are a convenience, not the gate.
 */
const ELIGIBLE: readonly OpportunityCompany['status'][] = [
  'shortlisted',
  'qualified',
  'contacted',
];

export function ConversationsPanel({
  opportunityId,
  companies,
  messages,
}: {
  readonly opportunityId: string;
  readonly companies: readonly OpportunityCompany[];
  readonly messages: readonly ConversationMessage[];
}) {
  const eligible = companies.filter(
    (c) => ELIGIBLE.includes(c.status) || messages.some((m) => m.companyId === c.id),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <MessagesSquareIcon className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Conversations</h2>
          <p className="text-xs text-muted-foreground">
            Atlas drafts a tailored message per company. You review, approve, and send —
            nothing sends without your approval.
          </p>
        </div>
      </div>

      {eligible.length === 0 ? (
        <section className="flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-card/50 px-6 py-14 text-center">
          <span
            className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <MessagesSquareIcon className="size-6" />
          </span>
          <h3 className="text-base font-semibold">No conversations yet</h3>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-balance text-muted-foreground">
            Shortlist a buyer or supplier in the Companies tab, then draft your first
            outreach here.
          </p>
        </section>
      ) : (
        <ul className="space-y-3">
          {eligible.map((company) => (
            <ConversationCard
              key={company.id}
              opportunityId={opportunityId}
              company={company}
              messages={messages.filter((m) => m.companyId === company.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ConversationCard({
  opportunityId,
  company,
  messages,
}: {
  opportunityId: string;
  company: OpportunityCompany;
  messages: readonly ConversationMessage[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ tone: 'info' | 'error'; text: string } | null>(null);

  const draft = messages.find((m) => m.status === 'draft' || m.status === 'approved');
  const history = messages.filter(
    (m) => m.status === 'sent' || m.direction === 'inbound',
  );

  const run = async (fn: () => Promise<{ status: string; message?: string }>) => {
    setBusy(true);
    setNote(null);
    const res = await fn();
    setBusy(false);
    if (res.status === 'error')
      setNote({ tone: 'error', text: res.message ?? 'Something went wrong.' });
    else router.refresh();
    return res;
  };

  const draftNew = () =>
    run(async () => {
      const fd = new FormData();
      fd.set('opportunityId', opportunityId);
      fd.set('companyId', company.id);
      return draftMessageAction(idleState, fd);
    });

  return (
    <li className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex size-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground"
          aria-hidden="true"
        >
          <BuildingIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{company.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {company.role}
            {company.country ? ` · ${company.country}` : ''}
          </p>
        </div>
      </div>

      {note !== null && (
        <Alert
          tone={note.tone === 'error' ? 'error' : 'info'}
          title="Outreach"
          className="mb-3"
        >
          {note.text}
        </Alert>
      )}

      {/* Sent / inbound history */}
      {history.length > 0 && (
        <ul className="mb-3 space-y-2">
          {history.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-border/60 bg-background/40 p-3 text-sm"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {m.direction === 'inbound' ? 'Received' : 'Sent'}
                  {m.subject ? ` · ${m.subject}` : ''}
                </span>
                <StatusPill status={m.status} />
              </div>
              <p className="text-[0.8125rem] leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {m.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Active draft, or a way to start one */}
      {draft ? (
        <DraftEditor
          key={`${draft.id}:${draft.status}:${draft.subject ?? ''}:${draft.body.length}`}
          opportunityId={opportunityId}
          message={draft}
          busy={busy}
          onRun={run}
          setNote={setNote}
        />
      ) : (
        <Button
          type="button"
          size="sm"
          onClick={draftNew}
          loading={busy}
          loadingLabel="Drafting…"
        >
          <SparklesIcon aria-hidden="true" />
          {history.length > 0 ? 'Draft a follow-up' : 'Draft with Atlas'}
        </Button>
      )}
    </li>
  );
}

function DraftEditor({
  opportunityId,
  message,
  busy,
  onRun,
  setNote,
}: {
  opportunityId: string;
  message: ConversationMessage;
  busy: boolean;
  onRun: (
    fn: () => Promise<{ status: string; message?: string }>,
  ) => Promise<{ status: string; message?: string }>;
  setNote: (n: { tone: 'info' | 'error'; text: string } | null) => void;
}) {
  const [subject, setSubject] = useState(message.subject ?? '');
  const [body, setBody] = useState(message.body);
  const approved = message.status === 'approved';
  const dirty = subject !== (message.subject ?? '') || body !== message.body;

  const form = (extra: Record<string, string>) => {
    const fd = new FormData();
    fd.set('opportunityId', opportunityId);
    fd.set('messageId', message.id);
    for (const [k, v] of Object.entries(extra)) fd.set(k, v);
    return fd;
  };

  return (
    <div className="rounded-xl border border-border/70 bg-background/40 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {message.aiGenerated && (
            <SparklesIcon className="size-3.5 text-primary" aria-hidden="true" />
          )}
          {message.aiGenerated ? 'AI draft' : 'Draft'}
        </span>
        <StatusPill status={message.status} />
      </div>

      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
        className="mb-2 w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/15"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={7}
        className="w-full resize-y rounded-lg border border-input bg-background px-2.5 py-2 text-sm leading-relaxed outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/15"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {busy && (
          <Loader2Icon
            className="size-4 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}

        {dirty && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() =>
              onRun(() => editDraftAction(idleState, form({ subject, body })))
            }
          >
            <CheckIcon aria-hidden="true" />
            Save edits
          </Button>
        )}

        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => onRun(() => regenerateDraftAction(idleState, form({})))}
        >
          <RefreshCwIcon aria-hidden="true" />
          Regenerate
        </Button>

        {!approved ? (
          <Button
            type="button"
            size="sm"
            disabled={busy || dirty}
            onClick={() => onRun(() => approveDraftAction(idleState, form({})))}
          >
            <CheckIcon aria-hidden="true" />
            Approve
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={async () => {
              const res = await onRun(() => sendMessageAction(idleState, form({})));
              if (res.status === 'success') {
                // Non-error outcomes include the honest "not configured".
                const summary = res as { data?: { status?: string; message?: string } };
                if (summary.data?.status && summary.data.status !== 'sent') {
                  setNote({
                    tone: 'info',
                    text: summary.data.message ?? 'Nothing was sent.',
                  });
                }
              }
            }}
          >
            <SendIcon aria-hidden="true" />
            Send
          </Button>
        )}
      </div>

      {approved && (
        <p className="mt-2 text-xs text-muted-foreground">
          Approved — ready to send. Editing will require re-approval.
        </p>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: MessageStatus }) {
  const style =
    status === 'sent'
      ? 'border-success/30 bg-success/10 text-success'
      : status === 'failed'
        ? 'border-destructive/30 bg-destructive/10 text-destructive'
        : status === 'approved'
          ? 'border-primary/30 bg-primary/10 text-primary'
          : 'border-border/70 bg-muted/50 text-muted-foreground';
  return (
    <span
      className={cn('rounded-full border px-2 py-0.5 text-[0.625rem] font-medium', style)}
    >
      {MESSAGE_STATUS_LABEL[status]}
    </span>
  );
}
