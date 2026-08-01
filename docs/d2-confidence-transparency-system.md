# D.2 — Confidence & Transparency System

**Type:** Product Doctrine (non-expiring)
**Version:** 1.0
**Date:** 2026-07-31
**Owner:** Product Design — AI Experience Architect
**Governed by:** _Atlas — Product Design Specification: The Intelligence Experience v1.1_ (the "Spec", esp. CT-1…CT-7, §18) and _D.1 — Atlas Voice & Communication Foundation_ (the "Foundation", esp. §6 Decision Language, §7 Lexicon). Where this document diverges from either, they govern and this document is corrected.
**Scope:** The permanent reference for how Atlas communicates certainty, uncertainty, verification, and trust across every AI-powered workflow. This is a communication and decision-design specification. It defines **language, meaning, and rules** — not UI components, visual encodings, thresholds implementation, or code.

> **The one-sentence system.** Atlas expresses _how sure it is about its own claims_ in three plain **certainty bands**, expresses _how complete the user's inputs are_ on one **readiness ladder**, always shows the reasons behind both, never invents a value it doesn't have, and always tells the user what the level means for their next move.

> **The calibration standard (inherited).** A CEO applies an extracted term from a $3M Letter of Intent. The certainty Atlas showed on that field is the difference between a confident, correct decision and an expensive, misplaced trust. Design every confidence signal as if that field were the one being applied.

---

## Table of contents

1. Purpose & Position
2. The Problem This System Solves
3. Core Concepts & Definitions
4. The Unified Confidence Taxonomy
5. Certainty Assignment Rules
6. Expression Standards
7. Verification Standards
8. Review Triggers (Stakes × Confidence)
9. Transparency & Reasoning Standards
10. Guidance & Next-Action Standards for Confidence
11. Accessibility Principles
12. Anti-Patterns
13. Future Extensibility — Recommendation Confidence
14. Governance, Checklist & Success Mapping

---

## 1. Purpose & Position

The Foundation (D.1) fixed the _words_ Atlas uses for certainty. This document defines the _system_ those words belong to: what kinds of confidence exist in Atlas, how each is decided and expressed, when uncertainty forces a human review, how verification upgrades trust, and how the whole system extends — without a new dialect — to the future concept of Recommendation Confidence.

It exists because confidence is the substance of an AI trade system. Atlas's outputs are judgments under uncertainty; the value it delivers is not the judgment but the _calibrated confidence_ that lets a professional act on it. A confidence system that is inconsistent, over-precise, or opaque doesn't just look unpolished — it silently transfers risk onto the customer. This document is how Atlas refuses to do that.

Position in the doctrine: **Spec → D.1 (voice) → D.2 (confidence).** D.1 governs the tone of every message; D.2 governs the meaning of every certainty signal. Later batches (D.3–D.7) apply both. The future Recommendation Confidence work (Spec §18) is a _consumer_ of this system, designed for here in §13.

---

## 2. The Problem This System Solves

The audit found four unrelated "confidence" languages coexisting in Atlas: a self-reported extraction **percentage** (with a fabricated 50% default for unknowns), an opportunity **readiness %/tier**, a profile **star meter**, and a bare company **fit number**. Four visual grammars, two different tier vocabularies with different cutoffs, and one silently invented value. The result: a user cannot build a single mental model of "how sure is Atlas," and at least one signal is not grounded in anything real.

The root confusion is that these four things are **not the same kind of thing**, yet they were expressed as if interchangeable. Two are about _Atlas's claims_ (extraction, fit); two are about _the user's input completeness_ (opportunity, profile). Conflating "how sure am I this is true" with "how complete is what you gave me" is the design error. This document separates them into two clean systems, unifies each internally, and defines the rules that keep them honest.

---

## 3. Core Concepts & Definitions

- **Claim.** Anything Atlas asserts as true or right: an extracted fact, a company's fit grade, a recommendation. Claims carry **Certainty**.
- **Input.** Anything the user provides that Atlas will act on: a brief, a profile. Inputs carry **Readiness**.
- **Certainty.** How sure Atlas is that a _claim_ is true or right. Expressed in three **bands** (§4.2).
- **Readiness.** How complete and actionable an _input_ is. Expressed on one **ladder** (§4.3). Readiness is not certainty; it is the leading indicator of it (§4.6).
- **Confidence class.** _What_ a certainty is about — a source fact, a match, or a recommendation (§4.4). All classes use the same bands; the class tells the user what "sure" means in context.
- **Reason.** The human-legible basis for a claim or score. Mandatory wherever a certainty or readiness appears (Spec CT-5).
- **Verification.** A human act that confirms a claim, which can upgrade its certainty to a user-confirmed state (§7).
- **The floor.** The minimum evidence below which a claim is always **Needs review**, never a middle band (§5).

The lexicon words for all of the above are fixed by the Foundation §7 and are mandatory here.

---

## 4. The Unified Confidence Taxonomy

Two expression systems, deliberately distinct, each internally unified.

### 4.1 Two systems, one grammar

| System        | Answers                                  | Applies to                               | Expressed as             |
| ------------- | ---------------------------------------- | ---------------------------------------- | ------------------------ |
| **Certainty** | "How sure is Atlas this is true/right?"  | Claims (facts, matches, recommendations) | Three **bands**          |
| **Readiness** | "How complete is what the user gave me?" | Inputs (brief, profile)                  | One four-tier **ladder** |

They never share a widget-language that implies equivalence, and they are never merged into a single number. A screen may show both (an extraction's certainty _and_ the brief's readiness), clearly distinguished.

### 4.2 Certainty — the three bands

Atlas expresses its certainty about any claim in exactly three bands. Each band maps to a distinct user action — which is why there are three, not five or a percentage.

| Band  | Canonical label  | Source-fact variant | Means                              | User's implied action |
| ----- | ---------------- | ------------------- | ---------------------------------- | --------------------- |
| **1** | **Confirmed**    | "Clearly stated"    | Directly, unambiguously supported  | Trust and apply       |
| **2** | **Likely**       | "Inferred"          | Reasoned, not explicit             | Glance, then apply    |
| **3** | **Needs review** | "Unable to verify"  | Uncertain, unknown, or conflicting | Verify before relying |

Rules that bind the bands:

- **Needs review is the loudest, never the quietest** (Spec CT-4). Uncertainty is the state that needs the human, so it is the most prominent.
- **The bands are the headline; numbers are not** (Spec CT-2). A numeric score may appear only as secondary, on-demand detail, never as the primary certainty signal, and never fabricated (§5).
- **A fourth, earned band exists: "Confirmed by you"** — the state after a human verifies a claim (§7). It is not something Atlas can assign to itself.

### 4.3 Readiness — the one ladder

All input completeness — opportunity brief, company profile, and any future input — uses a single four-tier ladder. This replaces the two divergent ladders the audit found.

| Tier           | What it means (capability-anchored)                                     |
| -------------- | ----------------------------------------------------------------------- |
| **Forming**    | Not yet enough for Atlas to act; the essentials are missing             |
| **Developing** | Atlas can begin, but results will be broad; specifics will sharpen them |
| **Strong**     | Enough for a focused, reliable search                                   |
| **Ready**      | Complete; Atlas can act with precision                                  |

Rules:

- **One ladder, one mapping, owned centrally** (Spec CT-6). A tier word means the same thing on every surface. The numeric mapping behind the tiers is defined once and shared, never re-invented per surface; tiers are anchored to _what the user can do_, not to arbitrary per-surface cutoffs.
- **"Ready," not "Excellent"** as the top tier — action-anchored (the user can act) rather than self-congratulatory, consistent with the Foundation lexicon ("Ready = complete enough to act").
- **Four tiers, because readiness is a progress continuum** — more tiers create motivating momentum. (Contrast: certainty has three, because it maps to three discrete decisions. Different purpose, different count — deliberately.)

### 4.4 Confidence classes — what a certainty is _about_

Every certainty band is applied to one of three claim classes. The class is always legible so "sure" is never ambiguous.

| Class                                         | The claim                              | How certainty is grounded                      |
| --------------------------------------------- | -------------------------------------- | ---------------------------------------------- |
| **Source confidence**                         | "This value is what the document says" | How explicitly the value appears in the source |
| **Match confidence**                          | "This company fits your opportunity"   | Strength of fit + how well-evidenced it is     |
| **Recommendation confidence** _(future, §13)_ | "This is the action worth taking"      | Reasoning + evidence behind the advice         |

**Match expression.** A match carries two composable signals, both governed here: a **fit grade** (Strong fit / Possible fit / Weak fit — a claim about _how well_ it fits) and a **certainty band** on that grade (_how sure_ Atlas is of it, grounded in reasons and source count). Example composition: "**Strong fit** — confirmed by 3 sources" vs "**Possible fit** — limited signal, worth verifying." One certainty vocabulary; no fourth dialect. ("Strong" appears in both fit and readiness; both mean "high," context disambiguates, and the shared adjective is intentional consistency.)

### 4.5 Why three bands (the rationale, recorded so it is not re-litigated)

- **Three maps to three actions:** trust / glance / verify. A confidence signal exists to drive a decision; more bands than decisions is false precision that induces paralysis.
- **It resists over-precision.** Numbers imply a calibration Atlas does not have (its raw signal is a model self-estimate). Three coarse, honest bands are _more_ truthful than a precise-looking number.
- **It is legible at a glance and by everyone** — including non-visual users and under cognitive load (§11).

### 4.6 Readiness is the leading indicator of Certainty (the systemic spine)

The two systems are linked by cause: **better inputs produce higher-certainty outputs.** A _Ready_ brief lets Atlas make _Confirmed_ claims; a _Forming_ brief forces _Needs review_ everywhere downstream. Atlas may make this link explicit to motivate input quality — "your brief is _Developing_, so many matches will need review; reach _Strong_ for confident results." This turns readiness into a purposeful lever, not a vanity meter, and connects the confidence system into one causal story.

---

## 5. Certainty Assignment Rules

How a claim earns its band. These are decision rules at the design level (not thresholds implementation).

- **CA-1 — Evidence, not vibes.** A band reflects the _evidence for the claim_, not how confident a model sounds. **Confirmed** requires direct, unambiguous support. **Likely** requires real but partial/derived support. **Needs review** is everything else.
- **CA-2 — Translate self-reports conservatively; never show them raw.** Where a model reports its own confidence, that signal is mapped into a band by design rule, and **rounded down at every boundary** (under-claim; Foundation §2.5). A raw model percentage is never the user-facing certainty.
- **CA-3 — Unknown is Needs review, never a fabricated middle.** If certainty is missing, unparseable, or below the floor, the claim is **Needs review** — never a plausible-looking default such as "50%." Fabricating a certainty is the gravest violation in this document (Spec CT-3).
- **CA-4 — The floor is real.** Below a minimum evidence threshold, no claim may be **Likely** or **Confirmed**, regardless of what any signal says. The floor protects the meaning of the higher bands.
- **CA-5 — Aggregates surface the weakest link, not an average.** A set of claims (e.g. all fields from one document) is never summarized by an averaged number that hides which parts are weak. It is summarized by its actionable weak points — "**3 fields need review**" — so the user's attention goes where the risk is. Averaging away uncertainty is prohibited.
- **CA-6 — Conflicts degrade, never blend.** When sources disagree, the claim is **Needs review** with the conflict surfaced — never a silent midpoint.
- **CA-7 — Stakes never inflate certainty.** Certainty is assigned from evidence alone. A high-value opportunity does not earn a higher band; it earns a stricter _review trigger_ (§8).

---

## 6. Expression Standards

How certainty and readiness appear in language. (Visual encoding is deferred to implementation batches; the _rules_ here bind those batches.)

- **EX-1 — Verbal-first, always.** The band or tier is communicated first as a **word** (Confirmed / Likely / Needs review; Forming…Ready). This is a hard rule, not a stylistic one — it is what makes the system survive color-blindness, screen readers, and reduced motion (§11).
- **EX-2 — Reasons are mandatory, not optional.** Every certainty and every readiness appears with its basis, or a one-tap path to it (Spec CT-5). No bare band, no bare tier, no bare number. Rationale computed anywhere must reach the user; it may never be discarded before display.
- **EX-3 — Numbers are secondary and rare.** A numeric detail may accompany a band only when it genuinely aids a decision, always subordinate to the word, never fabricated, never the headline. When in doubt, omit the number.
- **EX-4 — "Confidence" the word attaches only to bands.** The term "confidence" is never paired with a bare percentage. It names the banded system or nothing.
- **EX-5 — One phrasing family per band** (from the Foundation formulas), used consistently everywhere:
  - Confirmed: "Clearly stated in your document."
  - Likely: "Likely the MOQ — inferred, not stated. Worth a glance."
  - Needs review: "I couldn't verify this — please review before relying on it."
- **EX-6 — Certainty and readiness are visibly different kinds of thing.** They never share a presentation that implies they are the same measure; a screen showing both makes the distinction obvious in words.
- **EX-7 — Coverage and limits are part of the signal.** If a claim rests on partial input ("read the first ~40 pages"), the limit is disclosed alongside the certainty (Spec CT-7). A limit is a trust deposit, not an apology.

---

## 7. Verification Standards

Verification is how uncertainty becomes trust. It is a first-class part of the system, not an afterthought.

- **VS-1 — Below Confirmed always invites verification.** Any claim that is **Likely** or **Needs review** carries a standing, non-scolding invitation to verify ("worth a check"). The invitation empowers; it never implies the user did something wrong.
- **VS-2 — Needs review is the loudest and the most actionable.** It is the most prominent certainty state and always carries the most direct verify path, because it is the state that most needs the human.
- **VS-3 — Human verification is a distinct, earned state.** Once a user confirms a claim, it becomes **"Confirmed by you"** — a state Atlas cannot self-assign, ranking above Atlas's own **Confirmed** for decision purposes. This rewards the human's authority (PP-3) and creates a visible trail of what has been checked.
- **VS-4 — Verification is never a wall.** The user may proceed without verifying; verification is offered, not enforced — _except_ where a Review Trigger (§8) makes it mandatory for a high-stakes irreversible action.
- **VS-5 — Verification empowers, never scolds.** Language around it is an invitation ("worth confirming"), never a reprimand ("you must fix this"). Anxiety is reduced, not manufactured (Foundation §10.8).

---

## 8. Review Triggers (Stakes × Confidence)

When must a human explicitly review before Atlas proceeds? The answer is a function of **stakes** and **certainty**, not certainty alone. Low certainty on a trivial field is a gentle nudge; low certainty on a $3M term is a gate.

### 8.1 The trigger matrix (principle, not thresholds)

|                                                       | **Confirmed**  | **Likely**                   | **Needs review**                             |
| ----------------------------------------------------- | -------------- | ---------------------------- | -------------------------------------------- |
| **Low stakes** (reversible, minor)                    | Proceed        | Proceed; verify optional     | Proceed; verify offered                      |
| **Medium stakes** (shapes results)                    | Proceed        | Verify offered, prominent    | **Review before applying**                   |
| **High stakes** (irreversible / outbound / financial) | Verify offered | **Review before proceeding** | **Mandatory review; blocked until verified** |

### 8.2 Rules

- **RT-1 — Stakes are defined by consequence, not by surface.** Applying an extracted price to a live brief, sending outreach, and anything financial or irreversible are high stakes regardless of where they occur.
- **RT-2 — High stakes × low certainty is a mandatory gate.** Atlas does not let a professional commit an irreversible or financial action on a **Needs review** claim without an explicit human confirmation. This is the system's single hard stop.
- **RT-3 — Triggers guide, they don't nag.** Below the mandatory cases, a trigger surfaces a _prominent, skippable_ verify path — never a blocking modal for reversible actions.
- **RT-4 — The gate explains itself.** A mandatory review always states _why_ it appeared ("this term isn't verified and it's going into a $3M brief"), so it reads as protection, not obstruction.
- **RT-5 — Readiness can trigger too.** Acting on a _Forming_ input toward a high-stakes outcome surfaces a readiness caution before proceeding.

---

## 9. Transparency & Reasoning Standards

- **TR-1 — Every score shows its reasons.** No decision-driving certainty, fit, or readiness appears without a legible basis (Spec CT-5). This is the difference between decision support and a black box (Foundation §10.6).
- **TR-2 — Reasons are in the user's terms.** "In a target market, verified presence, confirmed by 3 sources" — trade language, not model internals.
- **TR-3 — Limits are disclosed early and framed as scope.** Partial reads, unsupported formats, thin evidence — stated plainly, not buried, not apologized for.
- **TR-4 — Provenance travels with certainty.** Where a claim came from ("via [source]", "from your document") is part of its transparency, so the user can weigh the source.
- **TR-5 — Never discard rationale.** Any reasoning computed upstream must be preserved to the point of display. Dropping reasons before they reach the user is a defect (this is the specific failure behind the audit's unexplained fit score).
- **TR-6 — The distribution, not the average.** For sets, show where the uncertainty concentrates, not a smoothed mean (see CA-5).

---

## 10. Guidance & Next-Action Standards for Confidence

Confidence exists to drive a decision; every confidence signal therefore carries the action it implies (Spec GN-1, GN-2).

- **GC-1 — Each band resolves to an action.** Confirmed → apply. Likely → glance, then apply. Needs review → verify. The action is present, not merely implied.
- **GC-2 — Gaps resolve to "add."** A "couldn't determine" / missing signal is a direct path to supply it, framed as sharpening (Spec GN-3), never a passive warning.
- **GC-3 — Readiness resolves to the next best input.** A readiness tier always names the single highest-value addition to reach the next tier (Spec GN-5), and connects it to the downstream confidence it will unlock (§4.6).
- **GC-4 — Verification resolves to progress.** Completing a verification visibly advances the state ("Confirmed by you"), so checking is rewarded with momentum, not just a cleared warning.
- **GC-5 — No confidence signal is a dead end.** A band, a tier, or a score with no next move fails review (Spec SC-6).

---

## 11. Accessibility Principles

Confidence is safety-critical information; it must reach every user through more than one channel. These principles are binding on all implementation batches.

- **AX-1 — Verbal-first is an accessibility guarantee.** Because the band/tier is always a word (EX-1), certainty survives color-blindness, monochrome, screen readers, and reduced motion. Meaning is never carried by color alone or by a number alone.
- **AX-2 — No single-channel encoding.** Certainty is never communicated _only_ by color, _only_ by position, _only_ by an icon, or _only_ by motion. At least the word is always present; other channels reinforce, never replace it.
- **AX-3 — Screen-reader parity.** The band, its reasons, and its implied action are available to assistive technology as text, in the same order of importance a sighted user perceives (Needs review is loud for everyone).
- **AX-4 — Reduced-motion parity.** Any motion used to draw attention to uncertainty has a static equivalent that conveys the same priority (inherits Spec ML-6). Nothing about confidence is motion-only.
- **AX-5 — Cognitive accessibility.** Three bands, plain words, one idea per message, reasons on demand rather than forced — the whole system is designed to lower cognitive load under time pressure, which serves everyone and especially stressed or neurodivergent users.
- **AX-6 — Consistent placement of meaning.** Because the vocabulary and order of importance are fixed, users learn the system once and rely on it everywhere — itself an accessibility property (predictability).

---

## 12. Anti-Patterns

Each is a release blocker for any confidence-related surface. Most are drawn from what the audit found in the live product.

| Anti-pattern                       | What it looks like                                        | Why it's banned                                                  |
| ---------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- |
| **Fabricated certainty**           | Unknown rendered as "50%"                                 | Invents a signal; transfers risk under false pretense (CA-3)     |
| **Raw self-report as headline**    | "84%" from a model's own estimate                         | False precision read as calibration it lacks (EX-3)              |
| **Averaging away uncertainty**     | One mean score hiding weak fields                         | Sends attention away from the risk (CA-5)                        |
| **Bare score, no reasons**         | "fit: 72"                                                 | Black box; unusable for a decision (TR-1)                        |
| **Quiet uncertainty**              | Needs-review shown as the faintest state                  | Buries the exact signal that needs the human (VS-2)              |
| **More bands than actions**        | Five confidence levels                                    | Precision theater; decision paralysis (§4.5)                     |
| **Color- or number-only encoding** | Certainty by hue alone                                    | Fails non-visual users; unsafe (AX-2)                            |
| **Two vocabularies for one thing** | Different tier words per surface                          | Breaks the single mental model (§4.3)                            |
| **Confidence word on a bare %**    | "Confidence: 84%"                                         | Violates the banded system (EX-4)                                |
| **Stakes-inflated certainty**      | Higher band because it's important                        | Corrupts the meaning of the bands (CA-7)                         |
| **Certainty as a wall**            | Blocking a reversible action on uncertainty               | Kills momentum; verification is an invitation, not a gate (VS-4) |
| **Silent high-stakes commit**      | Applying Needs-review data to a $3M action with no review | Removes the one mandatory human gate (RT-2)                      |
| **Discarded rationale**            | Reasons computed then dropped                             | Makes transparency impossible (TR-5)                             |
| **Readiness vanity**               | A completeness meter with no next action                  | Momentum dead end; not tied to outcomes (GC-3)                   |

---

## 13. Future Extensibility — Recommendation Confidence

_Forward-looking. Not built in D.2. Documented so this system is designed to carry it without a new dialect (Spec §18)._

### 13.1 The concept

Today the system expresses certainty about **facts** (source confidence) and **matches**. As Atlas matures from reading and ranking into **recommending** — which buyer to contact first, whether a term is competitive, what to prioritize — it will express certainty about **advice**: _Recommendation Confidence._ This is certainty about a judgment, not a fact.

### 13.2 It reuses this system entirely

Recommendation Confidence uses the **same three bands** (Confirmed / Likely / Needs review), the **same verbal-first rule**, the **same reasons-are-mandatory rule**, and the **same never-fabricate rule**. A user who has learned the certainty language for extracted facts already understands it for recommendations. No second confidence dialect is ever introduced.

### 13.3 What it adds (and only this)

A recommendation is a claim _plus_ two obligations beyond a fact:

- **An explicit recommended action** ("contact this buyer first"), always framed as advice the professional weighs — never a command (PP-3).
- **A "what would raise this" basis** — the reasoning, and what additional evidence or readiness would strengthen the recommendation — connecting it back to §4.6 (readiness → confidence).

### 13.4 Maturity ladder (from Spec §18, illustrative)

- **Level 0 — Source confidence** (today): how explicitly a value is stated.
- **Level 1 — Readiness** (today): how complete an input is.
- **Level 2 — Recommendation confidence** (future): how much to trust an action, in the shared bands, with reasons.
- **Level 3 — Calibrated, outcome-adjusted confidence** (further future): recommendation certainty that improves as real outcomes are observed — always within the same honest vocabulary and the human-decides stance.

### 13.5 The forward-compatibility requirement on D.2

This system is accepted only if it can attach a certainty band to a _recommendation_ — a judgment carrying an action and a basis — **without inventing a new visual or verbal language.** Concretely, D.2's design must not:

- assume a certainty is always about a _document-sourced fact_ (the bands must apply to judgments too);
- couple the bands to source-only reasoning (reasons must generalize to "why this advice");
- bake in that verification means "check against a document" (it must generalize to "confirm this judgment").

Meeting these is a design constraint on D.2, not a feature of it.

---

## 14. Governance, Checklist & Success Mapping

### 14.1 Ownership

The confidence taxonomy — the three bands, the one readiness ladder, the confidence classes, and their meanings — is **owned centrally** as product doctrine. No surface, batch, or prompt may introduce a new certainty vocabulary, a new tier ladder, or a new numeric certainty. Additions or changes are amendments to this document, versioned per the Spec (§20).

### 14.2 Review checklist (every confidence-related surface must pass all)

- [ ] Certainty uses the three bands; readiness uses the one ladder; the two are not conflated.
- [ ] The band/tier is expressed as a **word** first (verbal-first).
- [ ] Reasons are present or one tap away; no bare band, tier, or number.
- [ ] No numeric certainty is fabricated; unknown reads **Needs review**.
- [ ] No raw model self-report is shown as headline certainty.
- [ ] Aggregates surface the weak points, not an average.
- [ ] Needs review is the loudest certainty state and carries a verify path.
- [ ] Below **Confirmed**, verification is invited; high-stakes × low-certainty is gated (§8).
- [ ] Every band/tier/score resolves to a next action (no dead ends).
- [ ] Meaning is never color-only, number-only, icon-only, or motion-only.
- [ ] The capability's confidence vocabulary matches every other surface.
- [ ] It would survive the $3M LOU standard.

### 14.3 Mapping to Spec Success Metrics

This system is how the following Spec metrics are met:

- **SM-3 (one confidence format)** → §4 (two systems, each unified; no fourth dialect).
- **SM-2 (accurate provenance / signals)** → CA-3 (never fabricate), TR-4 (provenance travels).
- **SM-1 (comprehension)** → EX-1 verbal-first + §4.5 three-band legibility.
- **SM-5 (next-action coverage)** → §10 (every signal resolves to an action).
- Integrity gates **SM-6/SM-7** are reinforced by the anti-patterns in §12.

### 14.4 Forwarded to implementation batches

This document fixes language, meaning, and rules. It deliberately forwards to D.3 (motion) and to the visual-system work: the _visual encoding_ of bands and tiers (which must satisfy §11), the _numeric mapping_ behind the readiness ladder (owned centrally, tuned in build), and the _interaction_ of verification and review gates (§7–§8). Those are realized under this document's law; none may weaken a rule here.

---

_End of D.2 — Confidence & Transparency System. This is product doctrine, subordinate to the Spec and the Foundation, and superior to any individual design, ticket, or prompt. It is the permanent reference for every confidence-related decision in Atlas._
