# Atlas Implementation Blueprint — Sprint 4, Batch D

### The Product → Engineering handoff

**Version:** 1.0
**Date:** 2026-07-31
**Owner:** Principal Product Engineer / Staff UX Architect
**Governing law (do not reinterpret — apply):** Product Design Specification v1.1 (the "Spec"); D.1 Voice & Communication Foundation; D.2 Confidence & Transparency System; D.3 Honest Process & Motion.
**Nature:** Engineering blueprint. It states _what must change_ on every existing Atlas surface and _how it will be verified_. It contains **no code, no framework detail, no architecture changes, and no new features.** Where a change needs data that already exists to reach the UI (e.g. stop discarding computed reasons), that is called out as a **data-flow dependency**, never a redesign.

---

## 0. How to use this document

1. **Read §2 (Cross-cutting change patterns) first.** Nine reusable patterns (PAT-*) encode the doctrine once. Per-surface specs reference them by code instead of restating rules.
2. **Ship by batch (§1), not by surface.** Batches D-1…D-7 are independently shippable, preserve existing behavior, and each has a verification gate.
3. **Per surface (§3), engineers get:** current experience, problems (with audit IDs), applicable doctrine, required changes (Voice / Confidence / Process & Motion / Copy / UX / Trust), edge cases, acceptance criteria, QA scenarios, and a metadata line (Risk · Priority · Complexity · Dependencies · Batch).
4. **§4 is the master matrix** (surface → batch, risk, priority, complexity). §5 is the regression-safety contract. §6 is Definition of Done.

**Scales.**

- **Risk** (regression risk to shipped functionality): Low / Medium / High.
- **Priority:** P0 (actively misleads / breaks trust) · P1 (high) · P2 (medium) · P3 (low).
- **Complexity:** S (copy/label only) · M (state or presentation logic) · L (cross-surface system).

**Non-negotiables for every ticket:** preserve existing functionality; verify with typecheck + lint + format + the surface's QA scenarios; no operator/config language ever reaches a user; nothing implies work that didn't happen.

---

## 1. Engineering batch plan

Aligned to the Spec roadmap. Each batch is a shippable increment.

| Batch   | Theme                                   | Ships                                                                          | Depends on     | Risk    | Primary doctrine         |
| ------- | --------------------------------------- | ------------------------------------------------------------------------------ | -------------- | ------- | ------------------------ |
| **D-1** | Voice, naming & provenance truth        | Copy/label/provenance corrections across all AI surfaces                       | —              | Low     | D.1; Spec AC-D1/D3/F1    |
| **D-2** | Confidence & transparency system        | Three-band certainty + unified readiness ladder + reasons-with-scores          | D-1 vocabulary | Medium  | D.2                      |
| **D-3** | Honest process & motion                 | Kill fabricated progress; motion semantics; waiting/completion; idle stillness | D-1            | Medium  | D.3                      |
| **D-4** | One truth per capability                | Discovery status consistency; timeline honesty; capability naming              | D-1            | Low–Med | Spec JS-1                |
| **D-5** | Guidance & next-action                  | Next action on every output; readiness→CTA; missing→add; About You reframe     | D-2            | Low     | Spec GN-*                |
| **D-6** | Command Center intent                   | Route real intent / honest capture; remove inert hero                          | D-1, D-4       | Medium  | Spec §H2                 |
| **D-7** | Error, recovery & activating-soon voice | Audience split; cause+fix+fallback; truncation disclosure; "soon" reframe      | D-1            | Low     | D.3 §3.9–3.11; D.1 §5.14 |

**Ordering rationale (from Spec):** D-1 sets the vocabulary everything reuses; D-2 builds the certainty language; D-3 removes the acute trust risks in time/motion; D-4 removes contradictions; D-5/D-6 convert honesty into momentum; D-7 unifies the recovery/soon voice. D-1 and D-2 precede batches that consume their vocabulary.

**Batch ship gate (all batches):** typecheck/lint/format clean; the QA scenarios of every touched surface pass; a full regression pass of the touched flows shows no functional change; no new user-facing string violates the D.1 lexicon.

---

## 2. Cross-cutting change patterns (PAT-*)

Defined once; referenced everywhere. Engineering implements each pattern as a shared behavior/vocabulary so surfaces stay consistent.

### PAT-CB — Confidence bands (D.2)

- Replace every raw certainty **number-as-headline** with the three verbal bands: **Confirmed** (source-fact variant "Clearly stated") · **Likely** ("Inferred") · **Needs review** ("Unable to verify").
- **Verbal-first, never single-channel:** the band is always a word; color/icon/position only reinforce (D.2 AX-2). No band conveyed by color alone.
- **Never fabricate:** unknown/unparseable/below-floor → **Needs review**, never a defaulted middle value (kills the current NaN→50%).
- **Reasons mandatory:** every band shows its basis or a one-tap path to it; upstream rationale must reach the UI (no discarding).
- **Aggregates surface the weakest link:** a set's summary names the actionable weak points ("3 fields need review"), never an averaged number.
- **Needs review is the loudest** certainty state and carries a verify path.
- A number may appear only as secondary, on-demand detail, never fabricated, never the headline.

### PAT-RL — Readiness ladder (D.2 §4.3)

- Unify the two divergent ladders to one: **Forming → Developing → Strong → Ready** (top tier "Ready", not "Excellent").
- One shared tier mapping used by both the opportunity readiness meter and the profile match meter; tier word means the same thing on both.
- Every tier names the single highest-value next input to reach the next tier (PAT-NEXT), and may state the downstream confidence it unlocks.

### PAT-MO — Motion & state semantics (D.3 §4)

- **Work-motion only in Working/Waiting.** Remove all ambient "working" motion from idle/ready/preview/unavailable surfaces (D.3 ML-B).
- **Idle/Ready/Completed-at-rest = still.**
- **Instant acknowledgment:** any user action visibly registers immediately, before work/message.
- **Presence** ("Atlas online") is at most one global, minimal, non-work signal — never per-object.
- Reduced-motion parity; nothing critical is motion-only.

### PAT-WA — Waiting (D.3 §6, §11)

- Set an **expectation** at the start of any perceptible wait ("usually a few seconds").
- Cross to an honest **still-working** message before the user would wonder if it's frozen.
- On extended delay, **admit it** and offer control (cancel / continue elsewhere).
- For long operations, move to **leave-and-notify**; never hold the user hostage; **never fabricate progress or milestones.**

### PAT-CO — Completion (D.3 §8)

- Never "Done." Completion states **what changed + its certainty/readiness + the next action**, calmly (no celebration). Partial completion is disclosed.

### PAT-ER — Error & recovery (D.1 §5.14; D.3 §3.9–3.11)

- **Audience split:** no key/provider/endpoint/status-code language user-facing.
- Every error = **cause (plain) + fix + fallback**; input preserved; one-action retry over restart.
- Timeouts resolve to an honest Failed state with recovery, never an infinite spinner.

### PAT-SOON — Activating-soon (D.1 §4.9; D.3 §3.10)

- One identical status for a not-yet capability on **every** surface.
- Lead with what the user **can** do now; offer a single **notify-me** hook.
- **No runnable control that returns nothing.**

### PAT-PROV — Provenance truth (D.1 AC-2)

- Any "how produced" label (AI draft / template / suggested) is derived from the **actual result path**, including fallbacks — not from configuration/key presence.

### PAT-NEXT — Next action (Spec GN-1)

- Every AI output — success, uncertainty, empty, error, not-yet — ends with a next action or an honest forward reason + notify-me. No dead ends.

### PAT-NAME — Honest naming (D.1 AC-4/5)

- "AI," "analysis," "understood" only where a model produced the result. Heuristic/data-recap surfaces get plainer names.

---

## 3. Surface-by-surface specification

Grouped by product area. Each surface lists applicable PAT-* plus its specifics.

---

### AREA A — Dashboard

#### A1. Command Center ("Ask Atlas")

- **Current experience:** A prominent input ("What would you like Atlas to do?"), suggestion chips, and a send control. Submitting only echoes "You asked Atlas to '…'. Atlas is still being activated…"; chips prefill the box; an orbit/breathe orb animates. Nothing routes or acts.
- **Problems:** Audit H2 (inert flagship affordance); ambient work-motion on an idle surface (M5); dead-end submit (no next action).
- **Applicable doctrine:** Spec H2/JS-5; D.1 §5.9; D.3 PAT-MO, §9; PAT-NEXT.
- **Required changes:**
  - _UX:_ Route a submitted intent to the most useful **existing** destination (e.g. begin an opportunity aligned to the stated goal). Where nothing can act yet, capture intent honestly and visibly frame the surface as a **preview**, not a live command line.
  - _Process & Motion (PAT-MO):_ Remove the orbit/breathe work-motion; the idle input is still.
  - _Copy:_ Prompt → "What would you like to work on?" Submitted-with-no-destination → "Saved — I'll act on this the moment discovery is live." (notify-me).
  - _Trust:_ The most visible AI affordance never echoes into a void.
- **Edge cases:** unrecognized intent (offer the closest real destination or honest capture); empty submit (no-op, no error); repeated submits (dedupe capture).
- **Acceptance criteria:** No submitted input ends in an echo-only state; every submit either routes to a real destination or produces a captured-intent confirmation with notify-me; no work-motion on the idle surface.
- **QA scenarios:** submit a routable intent → lands on the real destination; submit a non-routable intent → honest capture + notify-me; verify no animation runs while idle; keyboard submit parity.
- **Meta:** Risk Medium · P1 · Complexity M · Deps: D-4 (capability status) · **Batch D-6** (motion part in D-3).

#### A2. Greeting

- **Current experience:** Deterministic, data-varied salutation/subline from real signals (name, timezone, first-day, quiet, weekend). The "active" tone requires actionsToday > 0, which is always 0 today, so that pool is unreachable.
- **Problems:** Minor — an unreachable "active"/"what I moved on today" tone could imply work that hasn't happened if it ever surfaced.
- **Applicable doctrine:** D.1 §2.2/§5.10 (no implied activity); PAT-MO.
- **Required changes:** _Copy/Logic-adjacent:_ ensure no greeting variant claims completed work while engines are pre-live; keep the honest data-grounded pools. No motion changes needed (already still).
- **Edge cases:** new account, night daypart, returning after quiet days.
- **Acceptance criteria:** No greeting asserts activity Atlas hasn't performed.
- **QA scenarios:** first-day, weekend, quiet-return greetings render truthfully; no "I moved on X today" appears pre-engines.
- **Meta:** Risk Low · P2 · Complexity S · Deps none · **Batch D-1**.

#### A3. Atlas Today (preview)

- **Current experience:** A dimmed, "Preview"-badged set of hardcoded example entries with a nudge that real entries replace them. Honest by design.
- **Problems:** None material — this is the model for an honest preview.
- **Applicable doctrine:** D.3 §4.8/§9 (preview must be inert + labeled); PAT-MO.
- **Required changes:** _Verify only:_ confirm no work-motion on the preview and the "Preview" framing remains unmistakable after D-3 motion cleanup. Align copy to the lexicon if needed.
- **Acceptance criteria:** Preview remains visibly inert and labeled; no active-processing motion.
- **QA scenarios:** preview cannot be mistaken for live activity in light/dark/reduced-motion.
- **Meta:** Risk Low · P3 · Complexity S · Deps none · **Batch D-3 (verify)**.

#### A4. About You

- **Current experience:** A card that says Atlas "learns your markets… and adapts. Here is what it knows so far," but every fact except timezone renders "Learning…"; nothing populates it.
- **Problems:** Audit L1 — implies passive learning that isn't happening; no path to advance it; several "Learning…" dead-slots.
- **Applicable doctrine:** D.1 §2.5 (no over-claim); PAT-NEXT; Spec GN.
- **Required changes:**
  - _Copy/Trust:_ Reframe from "learns and adapts" to what is true today — populate from **stated** profile facts Atlas actually knows, and honestly frame the rest ("I'll note your preferences as you work — nothing yet").
  - _UX (PAT-NEXT):_ Give at least one concrete action that fills a slot.
- **Edge cases:** brand-new profile (mostly empty) vs. rich profile.
- **Acceptance criteria:** No "Learning…" slot without either real content or an honest not-yet framing + an action; no claim of adaptive learning that isn't implemented.
- **QA scenarios:** empty profile → honest framing + action; populated profile → stated facts shown.
- **Meta:** Risk Low · P2 · Complexity S–M · Deps: profile data already present · **Batch D-5**.

#### A5. Business Pulse

- **Current experience:** Metric cards all in an "awaiting" state with "Soon" pills and em-dash values; subheading "Activates as Atlas starts working your market."
- **Problems:** Honest today, but part of the cumulative "inert" feel (L3); verify no fake motion/numbers.
- **Applicable doctrine:** PAT-SOON; PAT-MO; D.3 §9.
- **Required changes:** _Copy (PAT-SOON):_ align awaiting copy to the single activating-soon voice; ensure values remain em-dash (never placeholder numbers) and no work-motion on awaiting cards; add a notify-me hook consistent with other soon states.
- **Acceptance criteria:** No placeholder numbers; consistent soon-voice; no work-motion.
- **QA scenarios:** awaiting cards render em-dash + soon-voice; no animation implying live metrics.
- **Meta:** Risk Low · P3 · Complexity S · Deps: D-7 soon-voice · **Batch D-7**.

#### A6. Today's Briefing

- **Current experience:** Real "Handled" / "Needs you" items from true DB facts, with actionable hrefs; honest empty fallback.
- **Problems:** None material.
- **Applicable doctrine:** PAT-NEXT (already satisfied); D.1 voice.
- **Required changes:** _Verify + minor copy:_ confirm lexicon alignment; no changes to logic.
- **Acceptance criteria:** Items remain fact-grounded and actionable.
- **Meta:** Risk Low · P3 · Complexity S · **Batch D-1 (verify)**.

---

### AREA B — Opportunity Workspace

#### B1. Overview panel ("Atlas is preparing this search")

- **Current experience:** A banner "Atlas is preparing this search" with orbit/breathe animation; future-tense plan steps ("Read global trade data…"); a readiness meter (see B3); a dashed "live discovery activates in an upcoming release" callout.
- **Problems:** Audit M5 (work-motion while nothing runs — idle theater); C3 (discovery status must match everywhere).
- **Applicable doctrine:** D.3 PAT-MO/§4.3; PAT-SOON; D.1 §5 (honest ready state).
- **Required changes:**
  - _Process & Motion (PAT-MO):_ Remove orbit/breathe; render a calm **Ready** state.
  - _Copy:_ Replace "Atlas is preparing this search" (implies active work) with an honest ready/standing-by line ("Ready to search once discovery is live"). Keep plan steps but frame as what will happen, consistent with PAT-SOON.
  - _Trust:_ Motion reserved for real work.
- **Edge cases:** opportunity with a rich vs. empty brief.
- **Acceptance criteria:** No active-processing motion on the Overview; discovery status wording matches Companies + Timeline exactly (PAT-SOON).
- **QA scenarios:** open an opportunity → no orbit/breathe; ready copy shown; reduced-motion parity.
- **Meta:** Risk Low · P1 · Complexity S–M · Deps: D-4 status text · **Batch D-3** (+ D-4 copy).

#### B2. AI Analysis tab / AI Summary

- **Current experience:** Tab labeled **"AI Analysis"** rendering a recap of the user's entered brief (heading already corrected in a prior batch to "What Atlas understands from your brief"), plus the readiness meter and a "sharpen with these" list.
- **Problems:** Audit M2 — the **tab name** still over-claims model "analysis" for a data recap.
- **Applicable doctrine:** PAT-NAME (D.1 AC-4/5).
- **Required changes:**
  - _Copy (PAT-NAME):_ Rename the tab away from "AI Analysis" to match mechanism — e.g. "Readiness" or "Brief summary." Keep the honest heading/subtext.
  - _Confidence (PAT-RL):_ readiness meter uses the unified ladder.
  - _Guidance (PAT-NEXT):_ the "sharpen" list items are direct add-actions.
- **Acceptance criteria:** No surface names a data recap "AI Analysis"; readiness uses PAT-RL; each sharpen item is actionable.
- **QA scenarios:** tab label reads honestly; missing-field items link to add them.
- **Meta:** Risk Low · P2 · Complexity S–M · Deps: D-2 (PAT-RL) · **Batch D-1 (name)** + **D-2 (ladder)** + **D-5 (actions)**.

#### B3. Readiness / Quality meter

- **Current experience:** "72% · Strong" with a progress bar; tiers Forming/Developing/Strong/**Excellent** at thresholds 40/65/85; bar turns success-colored only at top tier.
- **Problems:** Audit M1 — a distinct tier vocabulary and cutoffs vs. the profile meter (two ladders).
- **Applicable doctrine:** PAT-RL; D.2 CT-6; PAT-NEXT; D.2 AX (verbal-first).
- **Required changes:**
  - _Confidence (PAT-RL):_ adopt the unified ladder Forming/Developing/Strong/**Ready** with one shared mapping; tier word is verbal-first (not color-only).
  - _Guidance (PAT-NEXT):_ pair the tier with the single highest-value next input and, where useful, the downstream confidence it unlocks (D.2 §4.6).
- **Edge cases:** very low (Forming) and complete (Ready) briefs; score exactly at a boundary.
- **Acceptance criteria:** Opportunity and profile meters use identical tier words/mapping; tier is a word first; a next input is always offered.
- **QA scenarios:** compare opportunity vs. profile meter at the same completeness → same tier; boundary values render the correct tier; screen-reader reads tier + reason + action.
- **Meta:** Risk Medium · P1 · Complexity M · Deps: shared ladder mapping (D-2) · **Batch D-2**.

#### B4. Timeline

- **Current experience:** Real events plus a pending "Atlas begins discovery — activates in an upcoming release" row.
- **Problems:** Must keep future rows clearly marked and never record simulated work (C3 consistency).
- **Applicable doctrine:** D.3 §3.7/§3.10; PAT-SOON.
- **Required changes:** _Copy:_ the pending discovery row uses the single soon-voice; ensure only Completed real events are shown as done.
- **Acceptance criteria:** Zero fictional/anticipated entries shown as completed; future rows marked activating-soon consistently.
- **QA scenarios:** timeline shows only real events as done; discovery row matches Overview/Companies wording.
- **Meta:** Risk Low · P2 · Complexity S · **Batch D-4**.

---

### AREA C — Opportunity Editor

#### C1. Opportunity Editor (brief)

- **Current experience:** Field-based editor; "Product or service" required with inline validation (prior batch); objective radiogroup; readiness not shown here.
- **Problems:** Minimal AI content; ensure any AI-adjacent copy follows the lexicon; no confidence/motion surfaces here.
- **Applicable doctrine:** D.1 voice; PAT-NEXT on save.
- **Required changes:** _Copy/Trust (verify):_ save/activate confirmations follow PAT-CO (what changed + readiness + next). Hint copy aligned to lexicon.
- **Acceptance criteria:** Save/activate produce a completion that states change + readiness + next action.
- **QA scenarios:** activate a brief → completion states new readiness tier + next step.
- **Meta:** Risk Low · P2 · Complexity S · Deps: PAT-RL · **Batch D-5**.

---

### AREA D — Documents & Extraction

#### D1. Document Upload

- **Current experience:** Shared Dropzone (prior batch); honest; measurable upload.
- **Problems:** None material; verify progress honesty and completion voice.
- **Applicable doctrine:** D.3 §5.2 (real progress allowed), PAT-CO, PAT-ER.
- **Required changes:** _Verify:_ upload progress is genuine; completion states what was added + next; failures preserve the file with retry (PAT-ER).
- **Acceptance criteria:** Progress only where measurable; completion + failure follow PAT-CO/PAT-ER.
- **QA scenarios:** upload success → honest completion; upload failure → file preserved + retry.
- **Meta:** Risk Low · P2 · Complexity S · **Batch D-3/D-7 (verify)**.

#### D2. Document Extraction — _flagship, highest priority_

- **Current experience:** On "Analyze," a **seven-step checklist** ("Reading document ✓ · Detecting countries ✓ · Detecting quantities ✓ …") advances on a fixed ~650 ms timer for a single model call, holding on the last step until the server returns; header "Atlas is reading {file}." Large text inputs are silently truncated (first ~100k chars). Error/degraded outcomes include operator language ("The AI extraction key was rejected. Check ANTHROPIC_API_KEY.").
- **Problems:** Audit C1 (fabricated staged progress — theater); H5 (undisclosed truncation); M4 (operator-language leak); M3 (no time expectation / stuck state / cancel).
- **Applicable doctrine:** D.3 PAT-WA, PAT-MO, §5 (honest progress), §11; D.1 §2.4; PAT-ER; D.2 (result carries certainty).
- **Required changes:**
  - _Process & Motion (PAT-WA/PAT-MO):_ **Remove the timer-driven multi-step checklist.** Enter Working with honest activity + expectation ("Reading your document — usually a few seconds"); at the wondering threshold shift to still-working ("Still reading — larger files take longer") + **Cancel**; for long runs, move toward leave-and-notify. No fabricated steps, percentages, or checkmarks.
  - _Copy/Trust (H5):_ If input is truncated, **disclose coverage** ("I read the first ~40 pages — later sections may be missed").
  - _Error (PAT-ER, M4):_ Replace operator errors with audience-appropriate copy ("Document reading is unavailable right now — I've kept your file. Try again, or complete the brief manually and I'll notify you when it's back.").
  - _Completion (PAT-CO):_ On success, transition to the review surface (D3) with certainty bands.
- **Edge cases:** very fast return (show result, minimal process UI); very slow/timeout (Failed + recovery, never infinite spinner); unsupported format; empty/zero-field result; cancel mid-run (clean stop, nothing kept).
- **Acceptance criteria:** No step/checkmark/percentage appears that isn't a real observed checkpoint; a duration expectation is set; a still-working state + Cancel appear past threshold; truncation is disclosed; no user-facing string contains a key/provider/status code; timeout → Failed + recovery.
- **QA scenarios:** analyze a small file (fast path); a large/slow file (still-working + cancel); a truncatable text file (coverage disclosed); force a service failure (audience-appropriate error + file preserved + retry); cancel mid-analysis (clean return to Ready); reduced-motion parity.
- **Meta:** Risk Medium · **P0** · Complexity M · Deps: PAT-ER, D2 review (D3) · **Batch D-3** (errors/truncation in D-7).

#### D3. Extraction Review (confidence + fields + gaps) — _P0_

- **Current experience:** Heading "Here's what Atlas understood"; overall "Confidence {pct}%"; per-field ConfidenceDot with **color-coded % and thresholds (≥0.8 / ≥0.5)**; unknowns default to **50%**; "Atlas couldn't determine" section for missing fields; fields shown as editable and applied on confirm.
- **Problems:** Audit C2 (false-precision confidence + fabricated 50% + color-coded); H4 (uncertainty not action-guiding); part of M1 (a fourth confidence dialect).
- **Applicable doctrine:** D.2 PAT-CB fully; D.2 §7 (verification), §8 (review triggers), AX (accessibility); PAT-NEXT.
- **Required changes:**
  - _Confidence (PAT-CB):_ Replace per-field % + color dots with the three **verbal bands** (Clearly stated / Inferred / Needs review); **remove the 50% default** — unknown → Needs review; **overall** becomes weakest-link ("3 fields need review"), not an average; a number may remain only as secondary on-demand detail.
  - _Verification (D.2 §7):_ below Confirmed, offer a verify path; **Needs review is the loudest** state; verifying upgrades to "Confirmed by you."
  - _Review triggers (D.2 §8):_ applying a Needs-review field toward a high-stakes brief surfaces a review before apply.
  - _Guidance (PAT-NEXT):_ each band resolves to an action (apply / glance / verify); each gap is a direct "add it."
  - _Copy:_ keep "Here's what I understood from [file]. Review before applying — nothing is saved until you do."
- **Edge cases:** zero structured fields (honest empty + manual path); conflicting values (Needs review, conflict surfaced); all-Confirmed (fast apply).
- **Acceptance criteria:** No numeric percentage is the headline certainty; no fabricated confidence; certainty is a word first (survives color-blind/screen-reader/reduced-motion); Needs review is most prominent and carries a verify action; overall summary names weak fields; every field/gap has a next action.
- **QA scenarios:** an unknown-confidence field reads "Needs review," never 50%; screen-reader announces band + reason + action with Needs-review prioritized; apply a Needs-review field to a high-value brief → review trigger; verify a field → "Confirmed by you"; monochrome render still communicates certainty.
- **Meta:** Risk Medium · **P0** · Complexity M–L · Deps: PAT-CB shared band vocabulary; **data-flow:** per-field confidence already exists · **Batch D-2**.

#### D4. AI Summary (within Documents area)

- Covered by **B2** (same surface / tab). Ensure the Documents-tab "Extract details" section and the AI Analysis tab remain distinctly named per PAT-NAME.
- **Meta:** see B2 · **Batch D-1/D-2**.

---

### AREA E — Companies & Discovery

#### E1. Discovery (Companies panel)

- **Current experience:** Header "Discover {who}"; an active **"Run discovery"** button ("Discovering…") that always returns an info note ("Discovery ran, but no data provider is connected yet — nothing was invented") and writes a timeline entry. Meanwhile the Overview tab says discovery is a future release.
- **Problems:** Audit C3 — contradictory capability status across tabs; a primary CTA that reliably no-ops (momentum trap).
- **Applicable doctrine:** PAT-SOON; D.1 §4.9/§5.6; D.3 §3.10; PAT-NEXT.
- **Required changes:**
  - _UX (PAT-SOON):_ Until a provider is live, present discovery as a single **activating-soon** state identical to Overview/Timeline; **remove the runnable button that returns nothing** (or disable with a clear reason + notify-me). No no-op run, no timeline entry for a non-run.
  - _Copy:_ "Discovery activates soon. Your brief is ready, so it runs the moment it's live — I'll notify you."
  - _Trust:_ one truth per capability, everywhere.
- **Edge cases:** future live state (results path — out of Batch D scope, but the soon-state must graduate cleanly); brief not yet ready (state what's needed first).
- **Acceptance criteria:** Discovery status wording is identical on Overview, Companies, and Timeline; no control runs to an empty result; a notify-me hook exists.
- **QA scenarios:** all three surfaces show the same discovery status; no "Run discovery" produces an empty info note; no phantom timeline entry.
- **Meta:** Risk Low–Med · **P0** (contradiction) · Complexity M · **Batch D-4**.

#### E2. Company Card (fit)

- **Current experience:** A bare numeric **"fit"** score with provenance "via {source}." The ranking layer computes human-readable **reasons**, but they are dropped before the company is persisted, so no reasons reach the card.
- **Problems:** Audit H3 — unexplained score; discarded rationale; contradicts the promise of "shown with the specific reason it matters."
- **Applicable doctrine:** D.2 §4.4 (match = fit grade + certainty + reasons), CT-5, TR-5; PAT-CB.
- **Required changes:**
  - _Confidence (PAT-CB / D.2 §4.4):_ Express fit as a **graded, reasoned** signal (e.g. "Strong fit — target market, verified presence, confirmed by 3 sources") rather than a bare number; the certainty of the grading is conveyed through reasons/source count; a number may be secondary only.
  - _Data-flow dependency:_ **stop discarding the computed reasons** so they reach the card (carry the existing signal to the UI — not a redesign).
  - _Trust:_ no opaque scores on a qualification decision.
- **Edge cases:** thin evidence (Possible/Weak fit, "worth verifying"); missing source; live-discovery-only (this surface is dormant until discovery is live — spec applies when it activates).
- **Acceptance criteria:** No fit signal appears without reasons; certainty is legible; provenance shown; number never the sole signal.
- **QA scenarios:** (when discovery live) a ranked card shows grade + reasons + source; a thin-evidence match reads "Possible fit — worth verifying."
- **Meta:** Risk Low (dormant surface) · P1 · Complexity M · Deps: **data-flow (preserve reasons)** · **Batch D-2** (activate with discovery).

---

### AREA F — Conversations & Outreach

#### F1. Conversations (draft lifecycle)

- **Current experience:** "Draft with Atlas" / "Drafting…"; a draft header pill reads **"AI draft"** (sparkle) vs "Draft" based on **key presence, not the actual draft path**; approve/send controls; "Approved — ready to send. Editing will require re-approval"; status pills (Draft/Approved/Sending/Sent/Failed).
- **Problems:** Audit H1 — provenance can be false (a fallback template while a key is present is still labeled "AI draft"); waiting is spinner+label only.
- **Applicable doctrine:** PAT-PROV; D.1 §4.5; PAT-WA; PAT-CO; PAT-NEXT.
- **Required changes:**
  - _Provenance (PAT-PROV):_ Derive the "AI draft" vs "Template draft" label from the **actual production path** (including model-failure fallback), not key presence. **Data-flow dependency:** surface the real path to the UI/label.
  - _Waiting (PAT-WA):_ "Drafting your message" with expectation; still-working past threshold.
  - _Completion/Guidance (PAT-CO/NEXT):_ draft ready → next action is review→approve; editing returns to Needs Input (re-approval) with clear copy.
- **Edge cases:** model failure with key present (→ "Template draft — I couldn't reach the model"); regenerate; edit-after-approve.
- **Acceptance criteria:** Every draft's provenance label matches how it was actually produced; no template is labeled "AI draft"; waiting sets an expectation; each state has a next action.
- **QA scenarios:** force a fallback with a key present → "Template draft…"; genuine model draft → "Draft ready for review"; edit an approved draft → re-approval prompt.
- **Meta:** Risk Medium · P1 · Complexity M · Deps: **data-flow (real draft path)** · **Batch D-1 (label)** + D-3 (waiting).

#### F2. Outreach Draft content

- **Current experience:** Template fallback embeds a visible placeholder ("[Add one or two specifics: volumes, terms, timelines.]"); honest but only self-identifiable by that placeholder.
- **Problems:** No explicit "this is a template" signal beyond the placeholder (ties to F1 provenance).
- **Applicable doctrine:** PAT-PROV; D.1 §4.5.
- **Required changes:** _Copy:_ pair the template body with the explicit provenance label from F1; keep the placeholder.
- **Acceptance criteria:** Template drafts are explicitly labeled as such (not only via placeholder).
- **Meta:** Risk Low · P2 · Complexity S · **Batch D-1**.

#### F3. Approval

- **Current experience:** Server-enforced approval gate (strong); client "Approve" disabled while busy/dirty; "Approved — ready to send. Editing will require re-approval."
- **Problems:** None material — this is a model behavior. Keep it.
- **Applicable doctrine:** D.1 §4.6; PAT-NEXT.
- **Required changes:** _Verify + copy:_ ensure gate copy matches lexicon; keep the visible human gate.
- **Acceptance criteria:** Approval remains an explicit, server-backed gate; copy states consequence.
- **Meta:** Risk Low · P2 · Complexity S · **Batch D-1 (verify)**.

#### F4. Sending

- **Current experience:** With no channel connected, send returns "Nothing was sent." and keeps the message approved; server refuses non-approved sends ("This message must be approved before it can be sent."); "No messaging channel is available."
- **Problems:** Honest; align to soon-voice and ensure "sent" is only ever true.
- **Applicable doctrine:** D.1 §4.6; PAT-SOON; PAT-CO.
- **Required changes:** _Copy (PAT-SOON):_ not-configured send → "Nothing was sent — no channel is connected yet. Your message stays approved and ready." + notify-me; real send → "Sent to [company]."
- **Edge cases:** channel down vs. not-configured vs. refused (distinct honest messages); message preserved in all.
- **Acceptance criteria:** "Sent" appears only after a real send; not-configured is honest + keeps the message ready + offers notify-me.
- **QA scenarios:** send with no channel → honest not-sent + message stays approved; attempt to send unapproved → refused; (when channel live) real send → "Sent."
- **Meta:** Risk Low · P1 · Complexity S · **Batch D-7**.

---

### AREA G — System states (cross-cutting, realized on every surface)

#### G1. Loading & Waiting states

- **Current experience:** The extraction pipeline (D2); spinners + button labels ("Drafting…", "Discovering…") elsewhere; an indeterminate bar on document upload.
- **Problems:** Fabricated-progress in extraction (C1); spinner-only waits elsewhere lack expectation/threshold behavior (M3).
- **Applicable doctrine:** PAT-WA, PAT-MO, D.3 §11.
- **Required changes:** Apply **PAT-WA** to every perceptible wait: expectation at start, still-working at threshold, control on delay, leave-and-notify for long ops; **PAT-MO** removes any work-motion from non-working states.
- **Acceptance criteria:** No perceptible wait is spinner-only without an expectation; no fabricated progress anywhere; long ops offer control.
- **QA scenarios:** each waiting surface sets an expectation and a still-working state; reduced-motion parity.
- **Meta:** Risk Medium · P0 (extraction) / P1 (others) · Complexity M · **Batch D-3**.

#### G2. Error states

- **Current experience:** Operator language in extraction ("Check ANTHROPIC_API_KEY"); generic "Something went wrong" titles in places; alert tones.
- **Problems:** M4 (operator leak); vague failures.
- **Applicable doctrine:** PAT-ER; D.1 §5.14.
- **Required changes:** Apply **PAT-ER** everywhere: audience-appropriate cause + fix + fallback; no keys/codes; preserve input; retry.
- **Acceptance criteria:** No user-facing error contains operator/config language; every error states cause + recovery + fallback.
- **QA scenarios:** trigger each error path (extraction, draft, send, discovery, upload) → audience-appropriate, actionable message; input preserved.
- **Meta:** Risk Low · P0 (leak) · Complexity M · **Batch D-7**.

#### G3. Recovery states

- **Current experience:** Optimistic document delete with rollback (prior batch); other flows refresh on success.
- **Problems:** Ensure interruption/failure preserves input and resumes rather than restarts.
- **Applicable doctrine:** D.3 §3.9–3.11; PAT-ER.
- **Required changes:** Confirm each failure path preserves the user's work and offers resume/retry; cancels stop cleanly with nothing partial kept.
- **Acceptance criteria:** No failure discards user input; cancel leaves no partial state; recovery resumes from preserved state.
- **QA scenarios:** fail mid-extraction/draft/upload → input preserved; cancel → clean Ready.
- **Meta:** Risk Low · P1 · Complexity S–M · **Batch D-7**.

#### G4. Success states

- **Current experience:** Confirmations like "Applied to the opportunity," various completions.
- **Problems:** Some are bare confirmations without change+certainty+next.
- **Applicable doctrine:** PAT-CO; PAT-NEXT.
- **Required changes:** Apply **PAT-CO** to every completion: state what changed + its certainty/readiness + the next action; calm, no celebration.
- **Acceptance criteria:** No completion is a bare "Done"; each states change + next; no exclamation/celebration.
- **QA scenarios:** apply extraction / activate brief / approve draft → completion states change + readiness/next.
- **Meta:** Risk Low · P1 · Complexity S · **Batch D-5**.

#### G5. Empty & Coming-Soon states

- **Current experience:** Deals ("Deal tracking activating soon"), business pulse, discovery, buyer-discovery journey step — honest but varied wording; some paired with an action, some not.
- **Problems:** L3 — cumulative inert feel; inconsistent soon-voice.
- **Applicable doctrine:** PAT-SOON; PAT-NEXT.
- **Required changes:** Apply the single **PAT-SOON** voice everywhere; every empty/soon state leads with what's possible now + a notify-me hook.
- **Acceptance criteria:** All coming-soon states use one voice; none is a pure dead end.
- **QA scenarios:** each soon/empty surface renders the unified voice + a forward hook.
- **Meta:** Risk Low · P2 · Complexity S · **Batch D-7**.

---

### AREA H — Onboarding, Auth, Profile, Settings

#### H1. Onboarding — Profile Builder & Match Quality

- **Current experience:** A wizard; the **Match Quality** meter shows stars + "%" with tiers **Starting/Developing/Strong/Excellent** at thresholds 25/50/75 — a different ladder than the opportunity meter. A "Preparing AI recommendations" transition screen uses orbit/breathe.
- **Problems:** M1 (second tier ladder); potential idle theater on the transition screen if no real work runs.
- **Applicable doctrine:** PAT-RL; PAT-MO; PAT-NEXT; D.2 AX.
- **Required changes:**
  - _Confidence (PAT-RL):_ adopt the unified ladder Forming/Developing/Strong/Ready with the shared mapping; keep the meter but make the tier verbal-first (not stars/color alone conveying level).
  - _Process & Motion (PAT-MO):_ the "Preparing…" screen may show work-motion **only** while genuine orchestration runs; otherwise it's a still transition.
  - _Guidance (PAT-NEXT):_ the single highest-value next field remains offered.
- **Edge cases:** brand-new empty profile; fully complete profile.
- **Acceptance criteria:** Profile and opportunity meters share tier words/mapping; tier is communicated verbally; motion only during real work.
- **QA scenarios:** same completeness → same tier as the opportunity meter; screen-reader gets the tier as text; transition screen still when nothing runs.
- **Meta:** Risk Medium · P1 · Complexity M · Deps: shared ladder (D-2) · **Batch D-2** (+ D-3 motion).

#### H2. Authentication

- **Current experience:** Sign-in/up with validation-error focus management (prior batch). No AI content.
- **Problems:** None AI-related. In scope only for voice consistency of any error/status copy.
- **Applicable doctrine:** D.1 voice; PAT-ER (for auth errors, audience-appropriate).
- **Required changes:** _Copy (verify):_ auth errors are plain and non-technical; no changes to logic or security.
- **Acceptance criteria:** No auth error exposes technical/internal detail; copy matches voice.
- **Meta:** Risk Low · P3 · Complexity S · **Batch D-1 (verify)**.

#### H3. Settings

- **Current experience:** Workspace/profile settings; no AI surfaces.
- **Problems:** None AI-related.
- **Applicable doctrine:** D.1 voice (only where copy references AI capability).
- **Required changes:** _Verify:_ any copy referencing AI capability follows PAT-NAME/PAT-SOON. Otherwise no change.
- **Acceptance criteria:** No settings copy over-claims AI capability.
- **Meta:** Risk Low · P3 · Complexity S · **Batch D-1 (verify)**.

---

## 4. Master matrix (surface → batch)

| Surface                               | Risk    | Priority | Complexity | Batch            |
| ------------------------------------- | ------- | -------- | ---------- | ---------------- |
| A1 Command Center                     | Med     | P1       | M          | D-6 (motion D-3) |
| A2 Greeting                           | Low     | P2       | S          | D-1              |
| A3 Atlas Today                        | Low     | P3       | S          | D-3 (verify)     |
| A4 About You                          | Low     | P2       | S–M        | D-5              |
| A5 Business Pulse                     | Low     | P3       | S          | D-7              |
| A6 Today's Briefing                   | Low     | P3       | S          | D-1 (verify)     |
| B1 Overview panel                     | Low     | P1       | S–M        | D-3 (+D-4)       |
| B2 AI Analysis tab / Summary          | Low     | P2       | S–M        | D-1 + D-2 + D-5  |
| B3 Readiness meter                    | Med     | P1       | M          | D-2              |
| B4 Timeline                           | Low     | P2       | S          | D-4              |
| C1 Opportunity Editor                 | Low     | P2       | S          | D-5              |
| D1 Document Upload                    | Low     | P2       | S          | D-3/D-7 (verify) |
| **D2 Document Extraction**            | Med     | **P0**   | M          | **D-3** (+D-7)   |
| **D3 Extraction Review (confidence)** | Med     | **P0**   | M–L        | **D-2**          |
| E1 Discovery                          | Low–Med | **P0**   | M          | **D-4**          |
| E2 Company Card (fit)                 | Low     | P1       | M          | D-2              |
| F1 Conversations (provenance)         | Med     | P1       | M          | D-1 (+D-3)       |
| F2 Outreach Draft content             | Low     | P2       | S          | D-1              |
| F3 Approval                           | Low     | P2       | S          | D-1 (verify)     |
| F4 Sending                            | Low     | P1       | S          | D-7              |
| G1 Loading & Waiting                  | Med     | P0/P1    | M          | D-3              |
| G2 Error states                       | Low     | **P0**   | M          | D-7              |
| G3 Recovery states                    | Low     | P1       | S–M        | D-7              |
| G4 Success states                     | Low     | P1       | S          | D-5              |
| G5 Empty & Coming-Soon                | Low     | P2       | S          | D-7              |
| H1 Profile Builder / Match Quality    | Med     | P1       | M          | D-2 (+D-3)       |
| H2 Authentication                     | Low     | P3       | S          | D-1 (verify)     |
| H3 Settings                           | Low     | P3       | S          | D-1 (verify)     |

**P0 set (do first, within their batches):** Document Extraction (D2), Extraction Review confidence (D3), Discovery contradiction (E1), Error-language leaks (G2). These are the four surfaces that actively mislead or contradict, per the audit.

---

## 5. Regression-safety contract

Every batch must preserve current functionality. Mandatory safeguards:

- **No behavioral change to server-enforced logic:** the approval→send gate, RLS/tenancy, document CRUD, and validation rules are untouched. Batch D changes _presentation and copy_, plus two explicit **data-flow** items (preserve computed match reasons; surface the real draft path for provenance) that add no new capability.
- **Feature parity:** every current action (upload, extract, apply, draft, approve, send, discovery-run→now-soon, delete) still reaches its outcome; only the communication changes.
- **Verification per batch:** typecheck + lint + format clean; the QA scenarios of all touched surfaces pass; a manual regression of each touched flow confirms unchanged outcomes; a copy audit confirms no new string violates the lexicon or leaks operator language.
- **Accessibility gate (applies to D-2, D-3, H1):** certainty and state are communicated **verbally**, never by color/motion alone; screen-reader order preserves the doctrine's priority (Needs review is loud); reduced-motion has parity.
- **Motion gate (D-3):** an inventory confirms no work-motion remains on idle/ready/preview/unavailable surfaces, and no progress indicator is timer-driven.

---

## 6. Definition of Done (Batch D overall)

Batch D is complete when, across every surface above:

1. **No surface implies work that didn't happen** (no fabricated progress/steps/completion; no idle work-motion).
2. **One confidence language** — three verbal bands for claims, one readiness ladder for inputs — with reasons and no fabricated values.
3. **One truth per capability** — discovery (and every capability) reads the same everywhere; no runnable no-op.
4. **Accurate provenance** — every "AI/template" label matches the real production path.
5. **Every AI output ends with a next action** or an honest forward reason + notify-me.
6. **No operator/config language** reaches any user; every error has cause + recovery + fallback.
7. **Naming matches mechanism** — "AI/analysis" only where a model ran.
8. **All governing acceptance criteria** (Spec §16, D.2 §14.2, D.3 §15, D.1 §11) pass for the touched surfaces, and the four P0 surfaces are verified first.

This blueprint is executable as written. Open, intentionally-forwarded items are limited to values tuned in build (perceptual wait thresholds; the exact numeric mapping behind the readiness ladder; the visual realization of bands and motion-meanings) — all owned by engineering under the governing doctrine and none altering a rule above.

---

_End of Atlas Implementation Blueprint — Sprint 4, Batch D. Subordinate to the Spec, D.1, D.2, and D.3. This is the final bridge before implementation._
