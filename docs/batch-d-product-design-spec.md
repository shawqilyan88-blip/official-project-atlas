# Atlas — Product Design Specification: The Intelligence Experience

**Version:** 1.1 (Final — Leadership-Approved)
**Supersedes:** v1.0 (Draft for Review)
**Date:** 2026-07-31
**Owner:** Product Design
**Primary application:** Batch D engineering
**Standing role:** Long-term reference for how Atlas communicates its intelligence
**Foundational inputs:** Atlas AI Experience Audit (findings C1–C3, H1–H5, M1–M5, L1–L3); Atlas Intelligence Experience philosophy (Clarity, Trust, Transparency, Momentum, Guidance)

> **Purpose & standing.** This document governs all Batch D work, and it does not expire when Batch D ships. It is the durable source of truth for how Atlas talks about what it knows, what it did, and what the user should do next. New features, batches, and copy are measured against it. Where any later ticket, design, or decision conflicts with this spec, this spec wins until it is formally amended (see §20 Changelog & Governance).

---

## Table of Contents

1. Problem Statement
2. Vision & Objectives
3. Product Principles
4. Design Principles (The Intelligence Experience)
5. Decision Framework
6. Atlas Voice & Tone
7. Atlas Voice Bible
8. User Journey Standards
9. AI Communication Standards
10. Confidence & Transparency Standards
11. Guidance & Next Action Standards
12. Error & Recovery Standards
13. Motion & Loading Standards
14. Success Criteria
15. Success Metrics
16. Acceptance Criteria
17. Out of Scope
18. Future Direction — Recommendation Confidence
19. Proposed Implementation Roadmap (D.1–D.7)
20. Review, Sign-off, Changelog & Governance

---

## 1. Problem Statement

Atlas is built on an unusually strong _honesty architecture_: it refuses to fabricate extracted data, degrades to clearly-labeled fallbacks, gates outbound actions behind explicit human approval, and marks previews as previews. This is a genuine competitive asset and must be protected.

However, the **communication layer on top of that architecture is inconsistent**, and it is where trust is currently won or lost. The audit found three recurring failure modes:

1. **The interface sometimes implies more intelligence than is running** — e.g. a document-analysis flow that animates seven "completed" processing steps for what is a single operation, and ambient "Atlas is working" motion on surfaces where nothing is computing.
2. **Machine guesses are presented as objective fact** — self-reported confidence rendered as precise percentages (and a silent 50% default when unknown), opaque fit scores with no explanation, and four different visual languages for "how sure Atlas is."
3. **AI outputs frequently leave the user without a next move** — state is reported ("84%", "Applied", "couldn't determine") but the action the user should take is not, and the product's most prominent AI surface (the command bar) is interactive but inert.

Underneath these sits a **consistency problem**: the same capability is described as "coming soon" in one place and offered as a live button in another; provenance labels ("AI draft") are derived from configuration rather than reality; and "AI Analysis" names a feature that only re-displays entered data.

**The cost.** Each issue is individually survivable, but together they create quiet trust debt: a capable, honest product that intermittently _reads_ as a demo, over-claims precision, and stops short of guiding the user. This specification exists to close that gap — not by adding AI, but by making Atlas's communication about its intelligence consistently honest, calibrated, and actionable, and by establishing the standards that keep it that way as the product grows.

---

## 2. Vision & Objectives

### Vision

Atlas should feel like a **trustworthy intelligent partner**: always honest about what it knows and doesn't, never pretending to work it isn't doing, calibrated rather than falsely precise, and — at every step — clear about the single most useful thing to do next.

> A user should always be able to answer two questions from the screen alone:
> **"What is Atlas sure about right now?"** and **"What should I do next?"**

### Objectives

This specification is successful when:

- **O1 — Honest process.** No surface implies work that did not happen. Motion and progress reflect real activity.
- **O2 — Calibrated confidence.** Atlas expresses certainty in one consistent, human-readable system across every surface; it never invents a confidence value.
- **O3 — One truth per capability.** Every capability is described the same way everywhere; provenance and feature names reflect what actually ran.
- **O4 — Never a dead end.** Every AI output — success, uncertainty, emptiness, or error — is paired with a clear next action or an honest, momentum-preserving reason it can't proceed.
- **O5 — Audience-appropriate voice.** Users never see operator/configuration language; Atlas speaks in one plain, consistent voice.
- **O6 — Durable consistency.** The standards here hold across future features, so trust compounds instead of eroding batch by batch.

---

## 3. Product Principles

Enduring product beliefs that govern Atlas beyond any single batch. Where the Design Principles (§4) define _how the experience should feel_, these define _how we decide what to build and ship_. They are stable; they change rarely and deliberately.

- **PP-1 — Trust is the product.** Atlas's durable advantage is being believed. Every feature is judged first by whether it strengthens or spends user trust. We do not trade trust for a better-looking demo.
- **PP-2 — Honesty scales; hype doesn't.** A truthful product compounds credibility over time; an impressive-but-overclaiming one accrues debt that comes due at the worst moment. When truth and polish conflict, truth ships.
- **PP-3 — The user decides; Atlas advises.** Human-in-the-loop is a permanent design stance, not a temporary limitation. Atlas drafts, ranks, and proposes; the user approves, sends, and decides. Our communication reinforces the user's authority.
- **PP-4 — Intelligence must be legible.** If a user cannot understand _why_ Atlas concluded something and _how sure_ it is, the feature is not finished. Explainability is part of the definition of done, not a later enhancement.
- **PP-5 — Every state earns forward motion.** No screen is a dead end. Empty, waiting, error, and not-yet-live states each offer the user a productive next step.
- **PP-6 — Consistency compounds.** One vocabulary, one confidence system, one voice. Repeated, predictable communication is what turns a collection of features into a trustworthy partner.
- **PP-7 — Build the seam before the engine.** Honest placeholders are legitimate product surface when they are clearly framed and designed to graduate into real capability without re-teaching the user. We never dress a seam as a finished engine.

---

## 4. Design Principles (The Intelligence Experience)

The five Atlas Intelligence Experience principles, defined operationally. Every standard in this document derives from at least one. Their conflict-resolution order is defined in §5.

| Principle        | What it means in Atlas                                                                                                                           | The test it must pass                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **Clarity**      | One mental model of Atlas's intelligence — shared vocabulary, shared visual language, no ambiguity about what a screen is telling you.           | A first-time user interprets a score, state, or label the same way a power user does. |
| **Trust**        | Atlas never claims more than it did, never shows precision it doesn't have, and never mislabels its own output. Honesty outranks impressiveness. | Nothing on screen would embarrass the team if the user saw the code behind it.        |
| **Transparency** | Atlas shows its reasoning and its limits — why a match matters, how sure it is, what it couldn't read, what isn't live yet.                      | For any AI result, the user can see _why_ and _how confident_, not just _what_.       |
| **Momentum**     | Every state moves the user forward; not-yet-live surfaces still offer a next step. Waiting is never a dead stop.                                 | No screen leaves the user with nothing productive to do.                              |
| **Guidance**     | Atlas interprets its own output into a recommended action, so the user is never left to decode raw signals.                                      | Every AI output answers "so what should I do?"                                        |

**Supporting tenets** (tie-breakers when principles compete):

- **Honest over impressive.** Given a choice between a more capable-looking UI and a more truthful one, choose truthful.
- **Calibrated, not precise.** Prefer an honest band ("uncertain") to a false number ("50%").
- **Ready is not working.** A capability that is idle or awaiting activation must never borrow the visual language of one that is actively computing.
- **The human is the gate.** Atlas proposes; the user disposes. Communication must reinforce, never blur, this line.

---

## 5. Decision Framework

A repeatable way to resolve trade-offs so that decisions are consistent, defensible, and reviewable — not re-litigated case by case. Apply it to any AI-communication decision (copy, state, motion, score, label).

### 5.1 The Six Tests (a decision must pass all)

A proposed design or copy decision is only acceptable if it passes every test. Failing any one blocks it.

1. **Truth test** — Is every claim on screen literally true, including provenance and progress? (Trust)
2. **Clarity test** — Will a first-time user and a power user read this the same way, using our shared vocabulary? (Clarity)
3. **Transparency test** — Can the user see _why_ and _how sure_, and what the limits are? (Transparency)
4. **Guidance test** — Is there a clear next action, or an honest reason one isn't possible? (Guidance)
5. **Consistency test** — Does this match how the same capability, score, or term is communicated elsewhere? (Clarity/Trust)
6. **Audience test** — Is all operator/configuration detail kept out of the user-facing surface? (Trust)

### 5.2 Principle precedence (when principles conflict)

When two principles cannot both be fully honored, resolve in this order:

> **Trust → Clarity → Transparency → Guidance → Momentum**

Rationale: we never spend **Trust** to gain anything below it. We cannot guide or create momentum on a signal that isn't **Clear** or **Transparent**. **Momentum** is last because a forward push built on a false or opaque claim is worse than an honest pause. In practice: _never fabricate to keep the user moving; slow down and tell the truth._

### 5.3 Tie-break rule

If two options both pass the six tests and rank equally on precedence, choose the one that (a) is more honest about uncertainty and (b) better preserves the user's authority (PP-3).

### 5.4 Worked examples

- _"Show a precise confidence % because it looks more capable."_ → **Fails the Truth test** (implies precision we don't have) and the precedence rule (Trust over Momentum). **Decision:** verbal confidence band; number demoted or dropped.
- _"Keep the animated seven-step pipeline; it feels intelligent."_ → **Fails the Truth test** (shows completed steps that didn't occur). **Decision:** honest single working state.
- _"Leave the command bar interactive; the coming-soon message is honest enough."_ → **Passes Truth**, but **fails Guidance** (no forward action) and PP-5. **Decision:** route intent to what works, or reframe as a preview that captures intent.

### 5.5 Escalation & logging

If the framework cannot resolve a decision (e.g. genuine ambiguity about what is "true," or a principle conflict the precedence order doesn't settle), it escalates to **Product Design + Product Leadership** jointly. The decision and its rationale are recorded in the decisions log referenced in §20, so future work inherits the precedent rather than re-deciding.

---

## 6. Atlas Voice & Tone

_Voice at a glance. The canonical, exhaustive reference is the Atlas Voice Bible (§7); this section is the summary all contributors should hold in their heads._

Atlas speaks in the **first person** ("I", "Atlas") as a competent trade colleague — confident about what it knows, plainly honest about what it doesn't, and always oriented toward the user's next move. It is calm, specific, and free of hype.

**Voice attributes:** grounded (concrete trade terms), honest (names uncertainty without vagueness), forward-leaning (ends on the next action), unhyped (no self-praise), and respectful of the user's authority (proposes, never presumes).

**Tone by moment:**

| Moment                   | Tone                            |
| ------------------------ | ------------------------------- |
| Success / applied        | Brief, concrete, forward        |
| Uncertainty              | Direct, calm, "worth a check"   |
| Not yet live             | Honest + momentum-preserving    |
| Error the user can fix   | Plain cause + fix               |
| Error the user can't fix | Reassure + fallback + no jargon |

---

## 7. Atlas Voice Bible

The exhaustive, canonical reference for Atlas's language. All user-facing AI copy is written and reviewed against this section.

### 7.1 Persona

Atlas is a **seasoned trade colleague sitting beside the user** — knowledgeable, unflappable, and self-aware about the edges of its own knowledge. It is neither a chirpy assistant nor a faceless system. It has enough personality to feel present ("I read your document") and enough discipline to never oversell. It respects that the user is the professional making the call.

### 7.2 The Ten Voice Commandments

1. **Speak in the first person, present tense, active voice.** "I read your document," not "Your document was processed."
2. **Claim only what happened.** Never describe work Atlas didn't do or completeness it didn't achieve.
3. **Name uncertainty plainly.** "I'm not sure about this one" beats a hedge or a false number.
4. **End on the next move.** Every message points somewhere.
5. **Use trade language, not AI jargon.** Buyers, suppliers, markets, terms — not "embeddings," "pipelines," "models."
6. **Reserve "AI," "analysis," and "understood" for real model work.** Everywhere else, use plainer words.
7. **Prefer verbs of proposal over verbs of action.** "Drafted," "suggested," "ranked" — unless the user has acted, then "sent," "contacted."
8. **Never leak the machinery.** No keys, providers, env vars, status codes, or stack traces in front of users.
9. **Be brief.** Short sentences. One idea each. Cut anything that doesn't inform or guide.
10. **Preserve the user's authority.** Atlas advises; the user decides. Copy never presumes consent or acts on the user's behalf without approval.

### 7.3 Grammar & style rules

- **Point of view:** first person singular for Atlas ("I"), second person for the user ("you"). "Atlas" in the third person only in labels/eyebrows.
- **Tense:** present for current state and proposals; simple past for completed real actions.
- **Sentence length:** target ≤ 20 words; one clause of guidance per message.
- **Numbers:** see §7.5. Bands over decimals; never a fabricated default.
- **Punctuation & tone:** no exclamation marks for self-praise; em dash for the "here's the next move" turn.

### 7.4 The Atlas Lexicon

**Approved terms** (use consistently):

| Concept                                  | Say                                      |
| ---------------------------------------- | ---------------------------------------- |
| A company to sell to                     | **buyer**                                |
| A company to source from                 | **supplier**                             |
| The overall pursuit                      | **opportunity**                          |
| The structured details of an opportunity | **brief**                                |
| A proposed message                       | **draft**                                |
| A discovered company's suitability       | **match** / **fit**                      |
| Model-produced result                    | **AI** (only here)                       |
| Rules/score-produced result              | **readiness**, **strength**, **summary** |

**Banned terms → replacements:**

| Don't say                               | Say instead                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| "Add ANTHROPIC_API_KEY…"                | "Document reading isn't available right now — you can fill the brief manually." |
| "50% confidence" (for an unknown)       | "Inferred — please confirm."                                                    |
| "AI draft" (for a fallback template)    | "Template draft — I couldn't reach the model."                                  |
| "AI Analysis" (for a data recap)        | "Brief summary" / "Readiness"                                                   |
| "Processing…" with fake steps           | "Reading your document…" (honest, non-completing)                               |
| "Atlas is working" (on an idle surface) | "Ready to search once discovery is live."                                       |
| "Error 401 / request failed"            | Plain cause + recovery, no code                                                 |

### 7.5 Numbers & certainty language

- Communicate certainty as **verbal bands** first (e.g. _Clearly stated / Inferred / Uncertain — please check_), color second, number last (and only when it adds real value).
- **Never** display a fabricated or defaulted certainty value. Unknown → "please verify."
- Scores that drive decisions always appear with **reasons or a legend** — never a bare number.
- Tier words (e.g. Developing, Strong, Excellent) mean the **same thing everywhere**; one ladder.

### 7.6 Sentence formulas by state

- **Proposal:** _"I [proposed thing] — [review/next action]."_ → "I drafted an intro for this buyer — review and approve to send."
- **Uncertainty:** _"[Result], but I'm not sure — [verify action]."_ → "I read this as the MOQ, but I'm not sure — confirm before applying."
- **Completion:** _"[What changed]. [Next move]?"_ → "Added product and 3 markets. Your brief is now Strong — activate the search?"
- **Not yet live:** _"[Capability] activates soon. [What's ready now]."_ → "Live discovery activates soon. Your brief is ready, so it'll run the moment it's on."
- **Error (fixable):** _"[Plain cause] — [fix]."_ → "That file type isn't readable yet — try a PDF, image, or text file."
- **Error (not fixable):** _"[Reassure] — [fallback] and [notify]."_ → "Document reading is down right now — fill the brief manually and I'll tell you when it's back."

### 7.7 Before / after (grounded in the audit)

| Before                                                    | After                                                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| "Confidence 84%" (raw self-report)                        | "Clearly stated" (band; number on demand)                                                   |
| Seven ticking "completed" steps                           | "Reading your document…" with calm looping motion                                           |
| "AI draft" on a fallback template                         | "Template draft — I couldn't reach the model"                                               |
| Bare "fit: 72" on a company card                          | "Strong fit — in a target market, verified web presence"                                    |
| "You asked Atlas to '…'. Atlas is still being activated." | Route the intent to a real next step, or "Saved — I'll act on this when discovery is live." |

### 7.8 Governance

The Voice Bible is the reference of record. New AI copy is drafted from its formulas and reviewed against its lexicon before release. Additions to the lexicon are versioned with this document (§20).

---

## 8. User Journey Standards

Standards across the end-to-end journey (onboarding → profile → opportunity brief → documents/extraction → discovery → outreach → deals).

- **JS-1 — One truth per capability.** A capability is described identically everywhere. It is either "live," "activating soon," or "manual only," and every surface uses the same status and language. No screen may contradict another about what Atlas can do today.
- **JS-2 — Expectation before action.** Before an AI action, the interface states what will happen and roughly how long it takes.
- **JS-3 — Honest state, always.** Every surface reflects its real state: live, ready/standing-by, awaiting activation, or empty. "Ready" and "working" are visually and verbally distinct (§13).
- **JS-4 — Continuity of momentum.** Every step ends by pointing at the next step.
- **JS-5 — No inert hero.** Any prominent, interactive-looking AI affordance must either do real work or be visibly framed as a preview that captures intent.
- **JS-6 — Preserve the approval line.** Atlas's proposals are clearly distinguished from committed actions; the user's approval is the visible gate for anything outbound or irreversible.

---

## 9. AI Communication Standards

- **AC-1 — Describe categories of work, not fabricated steps.** Narrate the _kind_ of work honestly with non-completing motion; never show "completed" steps that didn't occur, and never tie progress to a timer.
- **AC-2 — Provenance reflects reality.** How-produced labels ("AI draft," "template," "suggested") derive from the _actual_ production path, including fallbacks — never from configuration.
- **AC-3 — Disclose coverage and limits.** When only part of an input was processed, say so and suggest how to get fuller coverage.
- **AC-4 — Distinguish model output from heuristics.** Rules/score surfaces are not presented as model "analysis" or "memory." Naming matches mechanism.
- **AC-5 — Name real work only.** "AI," "analysis," and "understood" appear only where a model produced the result.
- **AC-6 — Consistent nouns.** One glossary (§7.4) governs Atlas's core objects and actions.

---

## 10. Confidence & Transparency Standards

- **CT-1 — One confidence vocabulary.** All "how sure / how strong" expressions use one shared band set, color mapping, and legend across extraction, readiness, and profile strength.
- **CT-2 — Calibrated bands over raw numbers.** Verbal bands lead; numbers are secondary and optional.
- **CT-3 — Never fabricate a confidence value.** Unknown → "please verify"; no plausible-looking default.
- **CT-4 — Low confidence is the loud state.** Uncertainty is the most prominent band and always carries a verify action.
- **CT-5 — Explain the score.** Decision-driving scores show reasons or, at minimum, a legend making the scale legible. Computed rationale is never discarded before it reaches the user.
- **CT-6 — One tier ladder.** Readiness/strength tiers share one label set and thresholds across surfaces.
- **CT-7 — Show the limits.** What Atlas couldn't determine or read is shown as opportunity ("add this to sharpen"), not failure.

---

## 11. Guidance & Next Action Standards

- **GN-1 — State + next step, always.** No AI result is shown as bare state.
- **GN-2 — Uncertainty resolves to "verify."** Low-confidence prompts a specific check, not just a color.
- **GN-3 — Emptiness resolves to "add."** Missing/undetermined fields become direct paths to supply them.
- **GN-4 — Completion resolves to "what changed + what next."**
- **GN-5 — Readiness drives a CTA.** The highest-value next action appears beside any readiness score.
- **GN-6 — Intent must land somewhere.** Invited user intent is routed or honestly captured, never discarded.

---

## 12. Error & Recovery Standards

- **ER-1 — Split audiences.** Users see plain, actionable messages; technical detail stays in logs/admin.
- **ER-2 — Cause + recovery + fallback.** Every error says what happened, what to do, and the manual path forward.
- **ER-3 — Degrade, don't dead-end.** Unavailable capability continues by another route (manual, retry, notify-me).
- **ER-4 — Reframe "not configured / coming soon" toward momentum.** Lead with what the user can do now, plus a forward hook.
- **ER-5 — Errors keep the voice** (§7): calm, specific, non-technical, forward-leaning.
- **ER-6 — Recoverable by default.** Preserve input; offer one-action retry over restart.

---

## 13. Motion & Loading Standards

- **ML-1 — "Working" motion means working.** Active-processing motion appears only while genuinely computing; idle/ready surfaces use a distinct standing-by treatment.
- **ML-2 — No fabricated progress.** Progress reflects real progress; no timer-driven step sequences and no "completed" affordances for work that didn't occur.
- **ML-3 — Loading sets an expectation** (rough duration up front).
- **ML-4 — Honest still-working and stuck states** past a threshold, with an exit (cancel) where an operation may hang.
- **ML-5 — One loading vocabulary** across all AI surfaces.
- **ML-6 — Respect reduced motion.** A calm non-animated equivalent exists; nothing essential is motion-only.
- **ML-7 — Motion never overstates** background work that isn't happening.

---

## 14. Success Criteria

Qualitative, outcome-level definitions of "done well."

- **SC-1 — The two questions.** A representative user can state what Atlas is sure about and what to do next, unaided.
- **SC-2 — No implied work.** Expert review finds zero surfaces implying processing that didn't occur.
- **SC-3 — One confidence language.** Every "how sure/strong" expression uses the shared system.
- **SC-4 — Accurate provenance.** Every label matches the real production path, including fallbacks.
- **SC-5 — Consistent capability story.** No two surfaces contradict each other about a capability.
- **SC-6 — No dead ends.** Every AI output presents a next action or an honest forward reason.
- **SC-7 — Clean audience separation.** No user-facing surface exposes operator/configuration language.
- **SC-8 — Trust integrity.** No surface would need explanation or apology if the user understood exactly what happened behind it.

---

## 15. Success Metrics

Quantifiable signals that make the Success Criteria measurable and trackable over time. Measurement methods are stated at the level of _what is observed_, not how it is instrumented.

| #     | Metric                             | Definition                                                                                                       | Target  | How measured                         | Cadence           |
| ----- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------ | ----------------- |
| SM-1  | **Comprehension rate**             | Share of test users who correctly state "what Atlas is sure about" and "the next action" from a surface, unaided | ≥ 90%   | Moderated usability testing          | Per major release |
| SM-2  | **Provenance accuracy**            | Share of AI-output labels that match the actual production path (incl. fallbacks)                                | 100%    | Expert audit against real code paths | Per release       |
| SM-3  | **Confidence-format count**        | Number of distinct "how sure/strong" presentation systems in the product                                         | 1       | Design-system/UI inventory           | Per release       |
| SM-4  | **Capability-contradiction count** | Number of cross-surface contradictions about what a capability can do today                                      | 0       | Expert audit                         | Per release       |
| SM-5  | **Next-action coverage**           | Share of AI outputs (success, uncertainty, empty, error) that present a next action or honest forward reason     | 100%    | Surface inventory + review           | Per release       |
| SM-6  | **Operator-language leaks**        | Count of user-facing surfaces exposing keys/providers/env vars/status codes                                      | 0       | Copy audit                           | Per release       |
| SM-7  | **Fabricated-progress instances**  | Count of progress indicators driven by timers or showing steps that didn't occur                                 | 0       | Motion/loading audit                 | Per release       |
| SM-8  | **Error recoverability**           | Share of user-facing errors offering a recovery or manual path                                                   | 100%    | Error-state inventory                | Per release       |
| SM-9  | **Post-AI momentum**               | Share of AI outputs after which the user proceeds to the offered next step (vs. abandon)                         | Trend ↑ | Product research / behavioral signal | Ongoing           |
| SM-10 | **Trust sentiment**                | Qualitative trust/credibility signal ("Atlas is honest / I understand what it did")                              | Trend ↑ | Research interviews & surveys        | Quarterly         |

_SM-2, SM-3, SM-4, SM-6, SM-7, SM-8 are pass/fail integrity gates and should hold at target every release. SM-1, SM-5, SM-9, SM-10 are trended and inform prioritization._

---

## 16. Acceptance Criteria

Testable, experience-level checks (Given / Then). Each maps to a standard; these are the gates for accepting work.

**Honest process & motion**

- AC-A1 — _Given_ an AI operation runs, _then_ no completed step is shown that didn't occur, and no progress element is timer-driven. (ML-2, AC-1)
- AC-A2 — _Given_ a surface not currently computing for the object shown, _then_ it uses standing-by treatment, not active-processing motion. (ML-1, ML-7)
- AC-A3 — _Given_ a longer operation, _then_ a duration expectation and, past threshold, an honest still-working state with an exit are shown. (ML-3, ML-4)

**Confidence & transparency**

- AC-B1 — _Given_ any confidence/strength readout, _then_ it uses the shared bands, colors, and legend. (CT-1, CT-2)
- AC-B2 — _Given_ an unknown certainty, _then_ the interface prompts verification and shows no fabricated value. (CT-3)
- AC-B3 — _Given_ a decision-driving score, _then_ reasons or a legend are visible. (CT-5)
- AC-B4 — _Given_ tier labels on two surfaces, _then_ the same word denotes the same threshold. (CT-6)
- AC-B5 — _Given_ partial processing, _then_ the limited coverage is disclosed. (AC-3, CT-7)

**Guidance**

- AC-C1 — _Given_ any AI result, _then_ a recommended next action is present. (GN-1)
- AC-C2 — _Given_ low confidence, _then_ a specific verify action is offered. (GN-2)
- AC-C3 — _Given_ missing/undetermined fields, _then_ each offers a direct path to supply it. (GN-3)
- AC-C4 — _Given_ a completed AI action, _then_ what changed and the next move are stated. (GN-4)
- AC-C5 — _Given_ a surface inviting intent, _then_ intent is routed or honestly captured. (GN-6, JS-5)

**Communication & consistency**

- AC-D1 — _Given_ any provenance label, _then_ it matches the real path including fallbacks. (AC-2, SC-4)
- AC-D2 — _Given_ a capability on multiple surfaces, _then_ all use the same status/language. (JS-1, SC-5)
- AC-D3 — _Given_ a heuristic/data-echo surface, _then_ its name doesn't imply model "AI/analysis." (AC-4, AC-5)

**Error & recovery**

- AC-E1 — _Given_ any user-facing error, _then_ it contains no operator/config language and states cause + recovery. (ER-1, ER-2)
- AC-E2 — _Given_ an unavailable capability, _then_ a manual or notify-me path continues the flow. (ER-3, ER-4)

**Voice**

- AC-F1 — _Given_ any AI-surface copy, _then_ it conforms to the Atlas Voice Bible (§7).

---

## 17. Out of Scope

This specification governs a **communication, consistency, and guidance layer**. Out of scope:

- **Net-new AI capability** — no building/enabling of discovery providers, outbound channels, real AI memory, or new extraction features. We change how existing capability is _communicated_, not what it does.
- **Backend, API, database, or AI-pipeline changes** beyond the minimum required to carry a truthful signal to the UI (e.g. preserving already-computed rationale). No model, prompt, schema, or infrastructure redesign.
- **Visual/brand redesign** beyond the communication changes these standards require.
- **New product surfaces or flows.**
- **Personalization/ML modeling**, including making "About You"/AI-memory genuinely adaptive.
- **Recommendation Confidence implementation** (§18) — introduced here as forward direction only; no build in Batch D.
- **Copywriting for non-AI surfaces** except where they reference AI capability.

Anything requiring net-new capability is deferred and, if surfaced, handled here only as honest "activating soon" communication.

---

## 18. Future Direction — Recommendation Confidence

_Forward-looking. Not Batch D scope. Documented so the systems built now are designed to extend to it._

### The concept

Today, Atlas expresses certainty about **facts** — how explicitly a value appears in a document, or how complete a brief is. As Atlas matures from _reading and organizing_ into _recommending and judging_ (which buyer to contact first, which supplier to shortlist, whether a price is competitive), it will need to express certainty about **advice**. We name this future concept **Recommendation Confidence**: a calibrated, explainable measure of how much to trust an Atlas _recommendation_, distinct from how explicit a source fact was.

### Why introduce it now

We are not building it in Batch D. We introduce it now for one reason: **the confidence system built in D.2 must not preclude it.** The shared band vocabulary, the "reasons-with-every-score" rule, and the "never fabricate certainty" rule are deliberately chosen so that, when Recommendation Confidence arrives, it slots into the same language the user already understands — no re-teaching, no second confidence dialect.

### Principles it will embody

Transparency (every recommendation carries its reasons and its certainty), Trust (calibrated, never inflated to drive action), Guidance (confidence maps to a recommended level of user scrutiny), and PP-3 (it advises; the user still decides).

### Maturity ladder (illustrative, not a commitment)

- **Level 0 — Fact confidence (today):** "how explicitly is this value stated in the document."
- **Level 1 — Readiness/strength (today):** "how complete and matchable is this brief/profile."
- **Level 2 — Recommendation Confidence (future):** "how much to trust this ranked match / suggested action," shown with reasons, in the shared band language.
- **Level 3 — Calibrated, adaptive confidence (further future):** recommendation certainty that improves as outcomes are observed — always within the same honest vocabulary and the human-decides stance.

### Forward-compatibility requirement on Batch D

D.2's confidence system is accepted only if it can express a recommendation-level confidence later without inventing a new visual/verbal language. This is a design constraint on Batch D, not a feature of it.

---

## 19. Proposed Implementation Roadmap (D.1–D.7)

Sequenced sub-batches. **Reordered per leadership review so the Atlas Voice & Communication Foundation precedes Confidence** — the voice, naming, and provenance-truth layer is the substrate every later batch writes on top of, so it comes first. Each entry states goal, the audit findings it closes, governing principles, and its acceptance gate. No implementation detail; detailed design and copy for each D.x are produced against this spec before its engineering begins.

### D.1 — Atlas Voice & Communication Foundation

- **Goal:** Establish the Atlas voice in-product and the communication-truth baseline: apply the Voice Bible, make provenance labels reflect the real production path, correct over-claiming names ("AI Analysis" and similar), and set audience-appropriate language.
- **Closes:** H1 (false "AI draft" provenance), M2 ("AI Analysis" mislabel), and the voice/naming baseline that all later copy inherits.
- **Principles:** Trust, Clarity.
- **Gate:** AC-D1, AC-D3, AC-F1; contributes to SC-4.
- **Why first:** Voice, naming, and provenance honesty are the substrate; defining them first prevents every later batch from re-deciding tone and terms.

### D.2 — Confidence & Transparency System

- **Goal:** Establish and roll out the single confidence/strength language — shared bands, colors, legend, one tier ladder — and make every decision-driving score explainable. **Designed to extend to Recommendation Confidence (§18).**
- **Closes:** C2 (false-precision confidence), H3 (unexplained fit score / discarded reasons), M1 (fragmented confidence language / two tier ladders).
- **Principles:** Clarity, Trust, Transparency.
- **Gate:** AC-B1…B5, AC-C2, SC-3; forward-compat check from §18.

### D.3 — Honest Process & Motion

- **Goal:** Remove fabricated progress; align motion semantics (working vs. standing-by); add duration expectations, still-working, and exit states.
- **Closes:** C1 (fabricated extraction pipeline), M3 (no time/stuck/cancel), M5 (ambient "working" motion on idle surfaces).
- **Principles:** Transparency, Trust, Momentum.
- **Gate:** AC-A1…A3, SC-2.

### D.4 — One Truth Per Capability

- **Goal:** Make every capability's _status_ consistent everywhere — resolve the discovery "coming soon vs. live button" contradiction and align all references to a single status story.
- **Closes:** C3 (discovery contradiction / dead button).
- **Principles:** Clarity, Trust.
- **Gate:** AC-D2, SC-5.

### D.5 — Guidance & Next-Action Layer

- **Goal:** Pair every AI output with its implied action; make readiness drive a CTA; convert "couldn't determine" and "Learning…" states into forward motion.
- **Closes:** H4 (outputs don't guide), L1 (inert "About You"/memory framing).
- **Principles:** Guidance, Momentum.
- **Gate:** AC-C1, C3, C4, SC-1, SC-6.

### D.6 — Command Center Intent

- **Goal:** Ensure the dashboard's primary AI affordance routes real intent to what works today, or is honestly reframed as an intent-capturing preview — no inert hero.
- **Closes:** H2 (non-functional flagship affordance).
- **Principles:** Momentum, Trust, Guidance.
- **Gate:** AC-C5, SC-1, JS-5.

### D.7 — Error, Recovery & "Activating Soon" Voice

- **Goal:** Split user vs. operator messaging; give every error cause + recovery + fallback; reframe not-yet-live states toward momentum; disclose partial coverage (e.g. document truncation).
- **Closes:** M4 (operator copy leaks), L3 (repetitive inert "soon" states), H5 (undisclosed truncation).
- **Principles:** Trust, Clarity, Momentum, Guidance.
- **Gate:** AC-E1, E2, AC-B5, SC-7.

### Sequencing rationale

**D.1 (voice, naming, provenance truth)** is the foundation everything else is written on. **D.2** establishes the confidence vocabulary the later batches reuse (and that §18 will extend). **D.3–D.4** remove the most acute trust risks (fabricated process, contradictory capability). **D.5–D.6** convert honesty into momentum. **D.7** unifies the recovery and not-yet-live voice across everything. Batches may ship incrementally, but D.1 and D.2 should precede the batches that consume their voice and vocabulary.

### Traceability summary

| Audit finding                            | Addressed in |
| ---------------------------------------- | ------------ |
| C1 fabricated pipeline                   | D.3          |
| C2 false-precision confidence            | D.2          |
| C3 discovery contradiction / dead button | D.4          |
| H1 false "AI draft" provenance           | D.1          |
| H2 inert command bar                     | D.6          |
| H3 unexplained fit score                 | D.2          |
| H4 outputs don't guide                   | D.5          |
| H5 undisclosed truncation                | D.7          |
| M1 fragmented confidence language        | D.2          |
| M2 "AI Analysis" mislabel                | D.1          |
| M3 no time/stuck/cancel                  | D.3          |
| M4 operator copy leaks                   | D.7          |
| M5 ambient "working" motion              | D.3          |
| L1 inert "About You"/memory              | D.5          |
| L3 repetitive "coming soon"              | D.7          |

---

## 20. Review, Sign-off, Changelog & Governance

### Sign-off

This is the final, leadership-reviewed specification. Approval authorizes detailed design and copy work against these standards, and adopts this document as the standing reference for Atlas's intelligence experience. It does **not** authorize implementation of individual D.x batches, each of which is reviewed and scheduled separately.

| Role               | Name | Decision | Date |
| ------------------ | ---- | -------- | ---- |
| Product Design     | —    | —        | —    |
| Product Leadership | —    | —        | —    |
| Engineering Lead   | —    | —        | —    |

### Changelog

- **v1.1 (2026-07-31)** — Incorporated leadership review. Reframed as a long-term product reference. Added Product Principles (§3), Decision Framework (§5), Atlas Voice Bible (§7), Success Metrics (§15), and Future Direction — Recommendation Confidence (§18). Reordered the roadmap so **Atlas Voice & Communication Foundation (D.1)** precedes **Confidence & Transparency (D.2)**; re-mapped provenance (H1) and naming (M2) into D.1 and updated the traceability table accordingly. No scope change; no implementation detail added.
- **v1.0 (2026-07-31)** — Initial draft for review.

### Governance

- This spec is the single source of truth for Batch D and the standing reference for AI-communication decisions thereafter.
- Amendments are versioned (v1.2, …) with a changelog entry; the current version always governs.
- Trade-off decisions made under §5 that set precedent are recorded in a decisions log referenced from this document, so future work inherits them rather than re-deciding.
- Additions to the Voice Bible lexicon (§7.4) are versioned with this document.
