# D.3 — Honest Process & Motion

### The Atlas Doctrine for Time, Waiting, and Movement

**Type:** Product Doctrine (non-expiring)
**Version:** 1.0
**Date:** 2026-07-31
**Owner:** Product Design — Motion & Human Factors / AI Experience Architect
**Governed by:** _Product Design Specification v1.1_ (esp. ML-1…ML-7), _D.1 — Atlas Voice & Communication Foundation_, _D.2 — Confidence & Transparency System_. This document extends them and may never contradict them.
**Scope:** How Atlas behaves in the interval between an action and its result — the design of time, waiting, process states, and the meaning of motion and stillness. This is doctrine, not implementation: **no durations, no easing, no components, no code.** Where perceptual time bands appear (§11), they are illustrative of human experience, not engineering values.

> **The vow.** Atlas never performs theater. It never pretends work is happening. It never implies progress that does not exist. Between action and result, every signal Atlas emits — a word, a movement, a silence — is true, and reduces the user's uncertainty about one of five questions: _Is it frozen? Did it work? What is it doing? Should I wait? Should I refresh?_

> **The calibration standard (inherited).** A CEO clicks "Analyze" on a $3M Letter of Intent and the screen goes quiet for eight seconds. In those eight seconds, Atlas either earns the CEO's trust by being honest about the wait, or loses it by faking a progress bar that later proves to be a stopwatch. Design the interval for that person.

---

## Table of contents

1. Purpose
2. The Philosophy of Time
3. The Atlas Process Model
4. Motion Semantics
5. Honest Progress
6. The Waiting Experience
7. Transition Design
8. Completion Philosophy
9. Background Intelligence
10. Attention Management
11. Long Operations
12. Anti-Patterns
13. Psychology
14. Real Atlas Rewrites (D.1 + D.2 + D.3)
15. Review Checklist
16. Adversarial Review (five lenses) & Resolutions

---

## 1. Purpose

Most product design treats the interval between action and result as dead space to be covered with a spinner. For an AI system it is the opposite: **the interval is where trust is decided.** Traditional software returns results instantly, so waiting is rare and meaningless. AI software thinks — visibly, and for uneven, unpredictable stretches — so waiting is constant and _the wait itself becomes a message_ about how reliable the system is.

Process design matters because **waiting is where users form their model of whether Atlas is trustworthy and in control.** A confident, honest wait says "this system knows what it's doing." A silent freeze or a fake progress bar says "this system is either broken or lying," and once a professional concludes either, they stop delegating.

Motion matters because **movement is a claim.** A moving element asserts that something is happening. If the assertion is false — motion on an idle surface, a bar that fills on a timer — Atlas has told a lie in a language the user reads faster than words. This document makes motion, stillness, and silence into a truthful language.

---

## 2. The Philosophy of Time

Atlas treats time as a designed material with a fixed set of meanings. Nine temporal concepts, each with a stance:

- **Waiting** — the user's experience of an interval. Atlas's job is to make waiting _legible_: name the real work, set an expectation, prove it isn't frozen. Waiting is never empty; it is managed.
- **Processing / Working** — Atlas is genuinely computing. Motion and "working" language are earned only here. Work is never simulated to look busy.
- **Idle** — nothing is happening, and that is fine. Idle is calm and still by default; it never borrows the appearance of work to seem alive.
- **Paused** — deliberately stopped by the user, fully resumable, with state preserved. Paused is a promise that nothing was lost.
- **Completed** — real work has ended and something in the world changed. Completion is a _handoff_ to the next move, never a full stop or a celebration.
- **Interrupted** — the flow was broken (a failure, a lost connection, a navigation). Atlas's duty is to preserve the user's work and make the break legible.
- **Retrying** — Atlas is attempting again after a transient problem. It is disclosed honestly ("taking longer than usual — retrying"), never hidden behind a longer fake wait.
- **Recovery** — the path back to a usable state after interruption or failure, with work intact. Recovery restores; it does not restart.
- **Cancelled** — the user chose to stop. Atlas ends cleanly, confirms nothing partial was silently kept, and returns to Ready.

The through-line: **every temporal state has one honest appearance and one honest vocabulary.** Atlas never lets one state wear the costume of another — idle never looks like working, retrying never hides inside waiting, a partial result never wears the face of completion.

---

## 3. The Atlas Process Model

The canonical state machine for any AI operation. Every process is always in exactly one of these states, and every state defines what Atlas may and may not do. (This is the temporal backbone that D.1's voice and D.2's certainty attach to.)

For each: **Purpose · User emotion · Atlas behavior · Communication rule · Exit condition · Never.**

### 3.1 Ready

- **Purpose:** signal availability without implying activity.
- **User emotion:** calm, in control, "I can act when I choose."
- **Atlas behavior:** still and quiet; the affordance to begin is clear; nothing moves.
- **Communication rule:** state what Atlas _can_ do and roughly what it will take; do not narrate.
- **Exit condition:** the user initiates, or a real dependency becomes available.
- **Never:** wear "working" motion; imply background activity that isn't happening.

### 3.2 Preparing

- **Purpose:** the brief, real pre-work before the main operation (validating input, opening a file, queuing).
- **User emotion:** "it received my request."
- **Atlas behavior:** immediate acknowledgment that the action registered, then a short honest hand-off into Working.
- **Communication rule:** acknowledge first, before anything else; name what's starting in the user's terms.
- **Exit condition:** main work begins (→ Working) or preparation fails (→ Failed).
- **Never:** be the whole show — Preparing is a doorway, not a staged sequence of fake steps.

### 3.3 Working

- **Purpose:** represent genuine, active computation.
- **User emotion:** confident patience — "it's actually doing this."
- **Atlas behavior:** honest activity indication tied to real work; an expectation set; the operation is nameable ("Reading your document").
- **Communication rule:** narrate the _category_ of work, never the machinery; never fabricate steps or percentages (§5).
- **Exit condition:** result ready (→ Completed), external hand-off (→ Waiting), user stops (→ Cancelled/Paused), or error (→ Failed).
- **Never:** show progress it cannot measure; hold the user hostage with no exit on long work.

### 3.4 Waiting

- **Purpose:** work is underway but the result hasn't returned — Atlas is not the bottleneck (a slow model, a provider, a queue). This is the honest "still working" state.
- **User emotion:** reassured it isn't frozen.
- **Atlas behavior:** confirm ongoing work, disclose that it's taking real time, offer a way to continue elsewhere as the wait extends.
- **Communication rule:** speak at the threshold where a user would start to wonder — not before, not never (§6).
- **Exit condition:** result returns (→ Completed), times out (→ Failed), or user stops (→ Cancelled).
- **Never:** sit in silent stillness that reads as frozen; convert the wait into fake progress.

### 3.5 Needs Input

- **Purpose:** Atlas is blocked on a human decision — including a D.2 verification or review gate.
- **User emotion:** clear ownership — "it's my move."
- **Atlas behavior:** stop, state exactly what's needed and why, make the decision easy.
- **Communication rule:** the request is specific and carries its own reason (D.2 §8.4).
- **Exit condition:** the user acts (→ Working/Completed) or defers (→ Paused).
- **Never:** wait on the user while looking like it's working; bury the ask.

### 3.6 Paused

- **Purpose:** a deliberate, resumable stop.
- **User emotion:** safe — "nothing was lost."
- **Atlas behavior:** hold state, show it's paused, offer resume.
- **Communication rule:** name it "Paused" (Lexicon), promise resumability plainly.
- **Exit condition:** resume (→ Working) or discard (→ Cancelled).
- **Never:** lose work; blur pause with cancel or failure.

### 3.7 Completed

- **Purpose:** real work ended; the world changed.
- **User emotion:** quiet momentum — "good, and here's what's next."
- **Atlas behavior:** state the change, carry the result's certainty (D.2), hand off the next action (§8).
- **Communication rule:** what changed + the consequence + the next move; no celebration.
- **Exit condition:** the user takes the next action, or the surface returns to Ready.
- **Never:** say only "Done"; claim completion for partial work; celebrate.

### 3.8 Cancelled

- **Purpose:** a clean, user-chosen stop.
- **User emotion:** in control — "I stopped it, and it stopped."
- **Atlas behavior:** end immediately, confirm no partial result was silently kept, return to Ready.
- **Communication rule:** confirm the stop plainly; state what (if anything) was preserved.
- **Exit condition:** back to Ready.
- **Never:** keep working after cancel; leave ambiguous half-state.

### 3.9 Failed

- **Purpose:** work could not complete.
- **User emotion:** oriented, not stranded — "I know what happened and what to do."
- **Atlas behavior:** state the cause in the user's terms, preserve their input, offer recovery (D.1 recovery pattern).
- **Communication rule:** cause + fix + fallback; no codes, no "something went wrong."
- **Exit condition:** retry (→ Working) or fallback path (→ Recovered).
- **Never:** fail silently; discard the user's work; end with no path forward.

### 3.10 Unavailable

- **Purpose:** the capability is not live yet, or a dependency is down.
- **User emotion:** informed, still moving — "not now, but here's what I can do."
- **Atlas behavior:** one consistent honest status everywhere (D.1 §4.9), lead with what's possible now, offer a notify-me hook.
- **Communication rule:** matter-of-fact, forward-leaning; identical wording across surfaces.
- **Exit condition:** capability activates, or the user takes the offered alternative.
- **Never:** present a runnable control that returns nothing; contradict the status on another surface.

### 3.11 Recovered

- **Purpose:** the usable state restored after interruption or failure.
- **User emotion:** relief and trust — "it kept my work."
- **Atlas behavior:** resume from preserved state, confirm what was recovered, continue.
- **Communication rule:** confirm recovery and what was kept; resume, don't restart.
- **Exit condition:** normal flow resumes.
- **Never:** silently drop progress; force a restart when resume was possible.

---

## 4. Motion Semantics

Not animation — **meaning.** Movement in Atlas is a small, closed vocabulary. Each motion-meaning is allowed only when its underlying claim is true. Stillness is a first-class member of this vocabulary, not the absence of design.

### 4.1 The six meanings of movement (and one of stillness)

| Meaning               | What the movement asserts              | Allowed only when                                                               | Forbidden when                                          |
| --------------------- | -------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Acknowledgment**    | "Your action registered"               | An action just occurred                                                         | Nothing happened                                        |
| **Work-in-progress**  | "Real computation is happening now"    | State is Working or Waiting                                                     | Idle, Ready, Unavailable, or completed                  |
| **Attention**         | "Something here needs you"             | A genuine user decision/uncertainty exists (e.g. D.2 Needs review, Needs Input) | To create engagement or urgency artificially            |
| **Transition**        | "The state just changed"               | A real state change occurred                                                    | To decorate; to mask a non-change                       |
| **Completion settle** | "Work ended and resolved"              | Work truly completed                                                            | For partial or fake completion; as celebration          |
| **Presence**          | "Atlas is available" (global, minimal) | A single global availability signal, visually distinct from work                | Per-object; anywhere it could read as "processing this" |
| **Stillness**         | "At rest; nothing is happening"        | The default for Ready/Idle/Completed-at-rest                                    | — (stillness is never dishonest)                        |

### 4.2 The laws of motion

- **ML-A — Motion is a claim; the claim must be true.** If movement implies work, work is happening. If it implies progress, progress is real and measured.
- **ML-B — Work-motion is exclusive to Working and Waiting.** No other state may use it. This is the rule that kills ambient "Atlas is working" on idle surfaces.
- **ML-C — Stillness is the default.** Motion is added only to carry one of the meanings above; a surface with nothing to say does not move.
- **ML-D — One meaning, one consistent motion-language.** A given meaning behaves the same way everywhere, so users learn it once (predictability = trust and accessibility).
- **ML-E — Attention-motion is rationed.** It is reserved for genuine, user-relevant needs (a Needs-review field, a time-sensitive decision). Overuse destroys its meaning.
- **ML-F — Completion settles; it does not celebrate.** The end of work is a calm resolution, never a flourish (D.1 §10.4).
- **ML-G — Presence is global and unmistakably not work.** Any "Atlas is online" signal lives in one global place and can never be confused with an object being processed.
- **ML-H — Motion never overstates** (Spec ML-7). When unsure whether a movement might imply more than is true, remove it.

### 4.3 When nothing should move

When Atlas is Ready, Idle, Unavailable, or displaying a completed result at rest, the correct amount of motion is **none.** Enterprise users read calm as competence; a perpetually animated interface reads as anxious or, worse, as faking activity. Stillness is how Atlas signals that it is stable and truthful.

---

## 5. Honest Progress

The complete philosophy of representing "how far along." The governing distinction is **measurable vs. unmeasurable**, because most AI work is unmeasurable and pretending otherwise is the central sin.

### 5.1 Unknown duration (the AI norm)

Almost all AI work has no honest percentage: a single model call returns when it returns. For these operations:

- Show **honest activity** + a **rough expectation** + the **category of work** ("Reading your document — usually a few seconds").
- **Never** a percentage, a filling bar, or discrete "completed" milestones, because none of them map to anything Atlas can measure.
- Let the experience **evolve by elapsed time**, not by fabricated position (§6, §11).

### 5.2 Known / measurable duration

A real progress indicator is permitted **only** when it maps to a genuinely countable reality — e.g. uploading a known set of files, or processing an enumerated list where each item's completion is observable. Then progress reflects true position. The test: _could Atlas be wrong about this progress?_ If the number is derived from a timer or a guess, it is forbidden.

### 5.3 Milestones

Milestones are shown **only when they are real, observable checkpoints** (e.g. "file received → reading → understood," if those are genuine transitions). A milestone is never emitted by a clock. If Atlas cannot observe the checkpoint, the checkpoint does not appear.

### 5.4 The hard prohibitions

- **Never fabricate milestones** — no staged checklist for a single operation.
- **Never fabricate percentages** — no number the system cannot measure.
- **Never fabricate completion** — no "done" until the work is done and its result exists.

### 5.5 Special cases

- **Short work:** if it's fast enough to be near-instant, show the result, not a process — a flash of process UI for sub-perceptual work is its own dishonesty (it implies effort that wasn't needed).
- **Long-running work:** escalate honesty over time (§11), never fabricate to fill the wait.
- **Background / queued work:** represented as _state_ ("Queued — I'll start when a slot frees"), never as active-processing motion (§9).
- **Partial work:** disclosed as scope, carried into the result's certainty (D.2 §6/§7): "I read the first ~40 pages."
- **Retry:** disclosed plainly ("taking longer than usual — retrying"), never hidden inside a longer silent wait.
- **Timeout:** resolves to an honest Failed state with recovery — never an infinite spinner.

---

## 6. The Waiting Experience

Waiting is not loading. Loading is a technical fact; **waiting is a human experience Atlas is responsible for.** The design goal is that a user never feels abandoned and never wonders if Atlas is frozen.

### 6.1 How Atlas reassures

By being legible, not by being busy: name the real work, set an expectation, and — as time passes — confirm the work continues. Reassurance is truth delivered at the right moment, never decorative motion.

### 6.2 When Atlas speaks

- **At the start:** always. Set the expectation ("usually a few seconds") and name the work. This single sentence prevents most "is it frozen?" anxiety.
- **At the wondering threshold:** when a wait exceeds the expectation, before the user has to ask — shift to an honest still-working message ("still reading — larger files take longer").
- **At extended delay:** admit it plainly and offer control (continue in the background, cancel, come back).
- **At completion:** resolve with the result, its certainty, and the next move.

### 6.3 When Atlas stays silent

For work fast enough to be imperceptible, and for trivial confirmations. Silence is a deliberate, honest choice — Atlas does not manufacture messages to seem busy (D.1 §8.5).

### 6.4 When Atlas changes its message

Only when something **true** has changed — a real state transition, or an elapsed-time threshold crossing (which is itself true). Message changes must correspond to reality. A rotating carousel of reassurances that implies a sequence of sub-steps is theater and is forbidden. If descriptive captions are used during a single operation, they may only describe the _scope_ of that one operation ("looking for products, markets, and terms"), never imply completed discrete steps, and never tick or check off.

### 6.5 When Atlas recommends action

As a wait extends past comfort, Atlas offers the user their time back: keep working elsewhere while it continues, or cancel. The user is never trapped watching a wait they could have stepped away from.

### 6.6 When Atlas admits delay

Immediately upon crossing the expectation it set. Admitting "this is taking longer than usual" is a trust deposit; pretending everything is on schedule while the user waits is a withdrawal.

---

## 7. Transition Design

State changes are never silent or jarring. Every transition is _acknowledged_ so the user always knows where they are. The first duty of any transition is **instant acknowledgment**: the moment between the user's action and Atlas's first response must be imperceptible — before any work, before any message, the action must visibly register. This is the primary answer to "Did it work?"

| Transition                  | How Atlas handles it                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Ready → Working**         | Acknowledge the action immediately; name what's starting and its expectation. The user never wonders if the click landed. |
| **Working → Waiting**       | Seamless; at the wondering threshold, shift to the honest still-working framing (§6.2). No visible "stall."               |
| **Waiting → Completed**     | Resolve with the result + its certainty band (D.2) + the next action. The wait ends in a decision, not a dead stop.       |
| **Completed → Next Action** | The completion _is_ the launchpad: it states what changed and offers the next move (§8).                                  |
| **Interrupted → Recovery**  | Preserve the user's work; state what broke; offer resume/retry. Never a blank restart.                                    |
| **Recovery → Working**      | Resume from preserved state, confirming what was kept; never re-do work the user already did.                             |
| **Working → Failure**       | Honest, specific, calm; the input is preserved; a path forward is offered.                                                |
| **Failure → Recovery**      | Cause + fix + fallback; one-action retry over restart (D.1 recovery).                                                     |

Cross-cutting rules: no transition surprises the user about their location in a flow; no transition discards work; no transition is masked by decorative motion; every transition leaves the user oriented.

---

## 8. Completion Philosophy

Completion is the most under-designed moment in most software and one of the most important in Atlas, because it is where confidence and momentum are either captured or lost. Atlas **never simply says "Done," "Finished," or "Complete."**

A true Atlas completion does four things:

1. **States what changed** — the real outcome in the user's terms ("Added product and 3 markets").
2. **Carries the result's quality** — the certainty or readiness the work produced (D.2), so the user knows how much to trust it ("your brief is now _Strong_").
3. **Hands off the next move** — the single most useful next action ("activate the search?"), because completion is a doorway, not an endpoint (Spec GN-4).
4. **Records truthfully** — updates the durable record (timeline) with only what really happened, distinguishing full from partial completion.

Completion is **calm, not celebratory** (D.1 §10.4): no exclamation, no confetti, no praise. In enterprise software, quiet competence at the finish line is what signals reliability. A partial completion is never dressed as a full one; its limits are disclosed and framed as the next opportunity.

---

## 9. Background Intelligence

Atlas will increasingly do work that is not in front of the user — queued, deferred, scheduled, or not-yet-live. The rule: **background work may be _represented_ as honest state, but never _performed_ as fake activity.**

- **Background (running elsewhere):** a quiet, truthful status the user can check ("Discovery is running — I'll surface matches as they qualify"), with no fabricated motion on surfaces where nothing is visibly happening.
- **Queued:** stated as position/expectation ("Queued — I'll start when a slot frees"), not as active processing.
- **Deferred / scheduled:** stated as intent and time ("Scheduled to refresh tonight"), never animated as if underway now.
- **Future capabilities:** the honest "activating soon" state (D.1 §4.9, Process state Unavailable), never dressed as running.

The line is bright: a truthful _status_ about invisible work is honest and reassuring; _motion or progress_ implying visible active work that isn't happening is theater. When work moves to the background, Atlas also honors §11's principle — the user can leave and be notified, rather than being held on a screen.

---

## 10. Attention Management

Atlas is a quiet operating system; interrupting the user is the most expensive thing it can do, because attention is the professional's scarcest resource and every needless interruption teaches them to ignore the next one.

### 10.1 The attention ladder (least to most intrusive)

1. **No communication** — non-events and routine successes. Most of what happens deserves silence.
2. **Ambient / passive** — a quiet state change the user notices when they look (a status updates in place). No interruption.
3. **Inline / banner** — relevant but not urgent; presented where the user already is, dismissible.
4. **Notification / interrupt** — reserved for the decision-relevant _and_ time-sensitive: something the user should act on now.

### 10.2 Rules

- **Interrupt only when it changes what the user should do now** and waiting would cost them.
- **Every interruption carries its action** — never "something happened," always "a buyer replied with a price question — worth a response today."
- **Never interrupt for Atlas's benefit** — no engagement bait, no "come back" nudges, no manufactured urgency (D.1 §6.8).
- **Expected states don't interrupt** — Working and Waiting are anticipated; they update ambiently, they never alert.
- **Respect focus** — a user mid-decision is not pulled away for anything less than a genuine, time-sensitive need.

---

## 11. Long Operations

As a wait grows, the _experience_ must evolve — from "wait here a moment" to "you can leave; I'll tell you." The evolution is keyed to human perception, not to engineering values; the phases below are illustrative bands, tuned in build, never fabricated.

| Experience phase                                     | The felt situation                  | How the experience should behave                                                                                                                                                                             |
| ---------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Instant** (a blink)                                | The result is essentially immediate | Show the result, not a process. No spinner for imperceptible work.                                                                                                                                           |
| **A moment** (a few seconds)                         | A brief, expected pause             | Honest activity + the expectation set at the start ("usually a few seconds"). No progress bar.                                                                                                               |
| **Longer than a moment** (the user starts to wonder) | "Is it stuck?" begins to form       | Cross into the still-working message _before_ the user asks; confirm it isn't frozen; offer to continue elsewhere.                                                                                           |
| **Clearly delayed** (past the promise)               | "This is taking a while"            | Admit the delay plainly; offer control (background, cancel); keep the user oriented on what's happening.                                                                                                     |
| **Extended** (into minutes)                          | The user shouldn't be trapped here  | Move to a background model: let the user leave and be notified on completion; the operation becomes a tracked, honest background status. Never hold them hostage; never fabricate progress to fill the time. |

Two absolutes across all phases: **never fake progress** to make time feel shorter, and **never abandon** the user to a silent, exit-less wait. The longer the wait, the more Atlas trades "watch me" for "I've got this — go, and I'll return to you."

---

## 12. Anti-Patterns

Every one is a release blocker for any process, waiting, or motion behavior. Most were found in the live product by the audit.

| Anti-pattern                               | What it looks like                                | Why it's forbidden                                                       |
| ------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------ |
| **Fabricated progress**                    | A checklist ticking on a timer for one operation  | Simulates work; the discovery of the trick voids all trust retroactively |
| **Fake percentages**                       | A bar filling toward a number Atlas can't measure | False precision; a measured claim that is a guess                        |
| **Fake completion**                        | "Done" before the result exists                   | The most damaging lie — the user acts on nothing                         |
| **Infinite spinner**                       | Motion with no expectation and no exit            | Cannot answer "is it frozen / should I wait?"; strands the user          |
| **Spinner-only waiting**                   | Movement with no words on a long wait             | Leaves the user to invent an explanation (usually "broken")              |
| **Celebrating fake or trivial completion** | Confetti/exclamation on finish                    | Consumer-grade; lowers perceived seriousness (§13)                       |
| **Motion without purpose**                 | Movement carrying no meaning                      | Dilutes the motion vocabulary; adds anxiety                              |
| **Permanent "working"**                    | An always-animated surface                        | Motion loses meaning; often implies work that isn't happening            |
| **Idle pretending to work**                | Ambient "Atlas is working" on a still surface     | Violates ML-B; a standing lie about activity                             |
| **Rotating fake steps**                    | A carousel implying sequential sub-tasks          | Theater dressed as reassurance (§6.4)                                    |
| **Jarring or silent transitions**          | State changes with no acknowledgment              | Disorients; breaks the answer to "did it work?"                          |
| **No acknowledgment**                      | An action with no immediate response              | The user re-clicks, doubts the system, loses control                     |
| **Hostage waiting**                        | Trapping the user on a long operation             | Denies control; the antidote is leave-and-notify (§11)                   |
| **Hidden retry**                           | Silently retrying inside a longer wait            | Conceals reality; erodes the honesty of the wait                         |
| **Timeout as infinite wait**               | Never resolving a stalled operation               | Must resolve to honest Failed + recovery                                 |
| **Lost work on interruption**              | A failure or navigation that discards input       | Breaks the recovery promise (state 3.11)                                 |

---

## 13. Psychology

Why every rule above exists. Engineers and designers should internalize this so they can extend the doctrine to situations it doesn't name.

- **Perceived time, not clock time, is what users feel.** An honest expectation ("a few seconds") and proof of ongoing work compress _perceived_ wait dramatically; ambiguity and silence inflate it. Atlas manages perception with truth, not with distraction.
- **Uncertainty is the source of waiting anxiety.** "Is it frozen?" is an _unknown-unknown_. A still-working signal converts it into a _known-known_ ("it's working, larger files take longer"), which people tolerate easily. We remove the anxiety by removing the ambiguity, not by hiding the wait.
- **Fake progress is a loan against trust at ruinous interest.** It buys a few seconds of comfort and, the moment it's noticed (a bar that jumps to 100%, a "step" that couldn't be real), it repays with the loss of belief in everything Atlas says. The trade is never worth it (Spec/Foundation trust asymmetry).
- **Acknowledgment is agency.** The instant confirmation that an action registered closes the action–feedback loop that gives humans their sense of control. Its absence makes capable software feel broken and makes users re-click, compounding the problem.
- **Predictability is what lets professionals plan.** A trader managing many opportunities needs to know whether to wait or move on. An honest expectation lets them decide; a mystery wait forces them to babysit the screen. Predictability is a productivity feature.
- **Calm signals competence in enterprise.** Consumer products use motion and celebration to signal delight; enterprise buyers read the same signals as unserious or anxious. Stillness, restraint, and quiet completion are the aesthetics of a system trusted with money.
- **Control is the antidote to feeling trapped.** Cancel, pause, and leave-and-be-notified transform a wait from captivity into a choice. The more capable and slower an operation, the more the user's sense of control depends on being able to step away.
- **Momentum is emotional fuel.** A completion that ends in a next action keeps the user in motion; a dead-end "Done" makes them feel the product stop and forces them to re-plan. Completion design is momentum design.
- **Consistency is trust and accessibility at once.** When a motion-meaning behaves identically everywhere, users learn it once and rely on it — which lowers cognitive load, aids assistive-technology users, and makes Atlas feel like one coherent system rather than a pile of features.

---

## 14. Real Atlas Rewrites (D.1 + D.2 + D.3)

Current Atlas behavior, redesigned with voice (D.1), certainty (D.2), and time (D.3) applied together.

### 14.1 Document extraction — _the flagship_

- **Before:** on "Analyze," a seven-step checklist ("Reading document ✓ · Detecting countries ✓ · Detecting quantities ✓ …") advances on a fixed timer for a single model call, then stalls silently on the last step until the server returns.
- **After:** the action is acknowledged instantly (→ Preparing). Atlas enters Working: "Reading your document — usually a few seconds," with honest activity and no fabricated steps. If it runs long (→ Waiting): "Still reading — larger files take longer," with a cancel option. On return (→ Completed): the extraction review opens with per-field **certainty bands** (D.2) and the next action; coverage is disclosed if the file was truncated.
- **Why better:** removes the single largest piece of theater in the product; the wait becomes legible and exitable; completion hands off a decision with honest certainty. (§3.3–3.4, §5.1, §6, D.2 §4)

### 14.2 Document upload

- **Before:** a button-triggered upload with an indeterminate motion, resolved by a full refresh.
- **After:** upload of a known file is genuinely measurable, so honest real progress is permitted; on completion, a calm confirmation of what was added and the next step. If it fails (→ Failed), the file is preserved with one-tap retry.
- **Why better:** progress is shown only where it's real; completion and failure both preserve momentum and work. (§5.2, §3.9, §8)

### 14.3 Discovery

- **Before:** a "Run discovery" button that spins and returns "nothing was invented," contradicted by "coming soon" elsewhere.
- **After:** discovery is in state **Unavailable** everywhere, with one identical honest status: "Discovery activates soon — your brief is ready, so it runs the moment it's live. I'll notify you." No runnable control that returns nothing. When it _is_ live, it runs in **Waiting/Background** and surfaces matches with certainty and reasons as they qualify (D.2 §4.4).
- **Why better:** one truth per capability; no dead-end button; the future state is honest and forward-moving. (§3.10, §9)

### 14.4 Outreach drafting

- **Before:** "Drafting…" then a draft labeled "AI draft" regardless of whether a model or a fallback template produced it.
- **After:** acknowledge instantly; Working: "Drafting your message." On return (→ Completed), the draft is labeled by its **true provenance** (D.1): "Draft ready for your review," or on fallback "Template draft — I couldn't reach the model." Editing returns to Needs Input (re-approval).
- **Why better:** honest wait + honest provenance + a clear next move. (§3, D.1 §4.5)

### 14.5 Timeline

- **Before:** entries can include anticipated/simulated steps alongside real ones.
- **After:** the timeline records only **Completed** real events in plain language; not-yet steps are clearly marked **Unavailable** ("Discovery — activates soon"), never shown as done.
- **Why better:** the ledger is beyond doubt; future work is honest, not fabricated. (§3.7, §3.10)

### 14.6 Dashboard & ambient motion

- **Before:** an orbiting "Atlas is preparing this search" animation on an opportunity where nothing is running; a perpetual "Atlas is online" pulse.
- **After:** the opportunity sits in **Ready** — still and calm — with "Ready to search once discovery is live." Any "online" presence is a single, global, minimal signal that can never be read as processing a specific object.
- **Why better:** work-motion is reserved for real work; stillness signals a stable, honest system. (§4.2 ML-B, §4.3, §9)

### 14.7 Command Center

- **Before:** typing intent returns "You asked Atlas to '…'. Atlas is still being activated" — an echo with no motion of the workflow.
- **After:** the intent is acknowledged and _routed_ to a real next step (start an opportunity toward that goal); where nothing can act yet, it's captured honestly ("Saved — I'll act on this the moment discovery is live") and the surface reads as a preview, not a live command line.
- **Why better:** the flagship never echoes into a void; every input advances something or is honestly deferred. (§9, D.1 §5.9)

### 14.8 Notifications

- **Before:** the risk of notifying on non-events or activation states.
- **After:** Atlas notifies only on the decision-relevant and time-sensitive, each carrying its action ("a buyer replied with a price question — worth a response today"); expected states (Working/Waiting) update ambiently and never alert.
- **Why better:** attention is protected; every interruption earns itself. (§10)

---

## 15. Review Checklist

Every process, waiting, or motion behavior must pass all before release.

**Acknowledgment & orientation**

- [ ] The user's action is acknowledged immediately, before any work.
- [ ] The user always knows which process state they're in.
- [ ] No transition is silent, jarring, or surprising about location.

**Honest motion**

- [ ] Every movement carries one of the defined meanings (§4.1).
- [ ] Work-motion appears only in Working/Waiting; idle/ready/unavailable are still.
- [ ] No motion implies work, progress, or completion that isn't real.
- [ ] Attention-motion is reserved for genuine user-relevant needs.
- [ ] Reduced-motion has a static equivalent; nothing critical is motion-only.

**Honest progress**

- [ ] No fabricated percentages, milestones, or completion.
- [ ] Progress indicators appear only where progress is genuinely measurable.
- [ ] Partial work and retries are disclosed honestly.

**Waiting**

- [ ] An expectation is set at the start of any perceptible wait.
- [ ] A still-working message appears before the user would wonder if it's frozen.
- [ ] Extended waits admit delay and offer control (background/cancel).
- [ ] No infinite spinner; timeouts resolve to honest Failed + recovery.

**Completion**

- [ ] Completion states what changed + its certainty + the next move; it never just says "Done."
- [ ] Completion is calm, not celebratory; partial completion is disclosed.

**Interruption & control**

- [ ] Interruption preserves the user's work; recovery resumes, not restarts.
- [ ] Cancel stops cleanly and confirms nothing partial was silently kept.

**Background & attention**

- [ ] Background/queued/future work is represented as honest state, never faked motion.
- [ ] Interruptions are decision-relevant, time-sensitive, and carry their action.

**The standard**

- [ ] It would reassure — not deceive — the CEO waiting on the $3M LOI.

---

## 16. Adversarial Review (five lenses) & Resolutions

The doctrine was challenged from five perspectives before finalization; the weaknesses and resolutions are recorded so the reasoning is inheritable.

### 16.1 Motion Designer — _"Does honesty flatten the craft into a dead, static UI?"_

- **Weakness:** a fear that "stillness by default" produces a lifeless product. **Resolution:** the motion vocabulary (§4.1) is rich and intentional — acknowledgment, transition, attention, and completion-settle give ample expressive craft; what's removed is only _dishonest_ motion. Restraint is the craft here, as it is in the premium products Atlas benchmarks against. Stillness is framed as a positive signal (competence), not an absence.

### 16.2 Enterprise Customer (the $3M CEO) — _"Will this make me feel in control of my time, or managed by the tool?"_

- **Weakness:** long operations could still feel like captivity. **Resolution:** §11's evolution explicitly trades "watch me" for "leave and I'll notify you" as waits extend, and §10 protects the user's attention; control (cancel/pause/background) is elevated to a first-class right, not a hidden affordance.
- **Weakness:** honesty about delay could read as the tool being slow/weak. **Resolution:** §13 reframes admitted delay as a _trust deposit_; the doctrine treats "taking longer than usual" as confidence, and the leave-and-notify model turns Atlas's slowness into the user's freedom.

### 16.3 Product Psychologist — _"Is this grounded in how people actually experience time, or just principled?"_

- **Weakness:** rules risked being ethics without mechanism. **Resolution:** §13 ties each rule to a specific mechanism — perceived vs. clock time, uncertainty-as-anxiety, acknowledgment-as-agency, predictability-as-planning, calm-as-competence — so the _why_ is operational, not moral posture.
- **Weakness:** the "wondering threshold" is subjective. **Resolution:** it is defined by user _experience_ (the point at which "is it stuck?" forms), and §11 keys the escalation to perception, deliberately leaving exact values to be tuned with research in build (not fabricated here).

### 16.4 Accessibility Specialist — _"Does a motion-centric doctrine exclude anyone?"_

- **Weakness:** meaning could be carried by motion that some users can't perceive. **Resolution:** ML-D consistency plus the checklist require a _static/textual equivalent_ for every motion-meaning and honor reduced-motion (Spec ML-6); critically, process _state_ and _waiting_ are communicated in **words first** (inherited from D.1/D.2), so a screen-reader or reduced-motion user gets the full temporal picture without any motion at all. Acknowledgment and completion are never motion-only.
- **Weakness:** anxiety-management assumes a neurotypical time sense. **Resolution:** predictable, consistent, plainly-worded states and explicit expectations serve cognitive and anxiety-sensitive users especially well; the doctrine's calm/low-stimulation default is itself an accessibility posture.

### 16.5 Systems Designer — _"Is this a coherent system or a list of rules?"_

- **Weakness:** rules could conflict at the edges (e.g. silence vs. reassurance). **Resolution:** the Process Model (§3) is a single state machine every rule attaches to, and the precedence is inherited from the Spec (Trust → Clarity → Transparency → Guidance → Momentum), which resolves conflicts deterministically — e.g. silence yields to reassurance exactly when ambiguity would otherwise erode trust.
- **Weakness:** extensibility to future background/agentic work. **Resolution:** §9's "represent, never perform" rule and the Unavailable/Background states generalize cleanly to future autonomous operations; the doctrine already separates _doing_ work from _depicting_ it, which is the exact seam agentic features will need.

**Standing outcome.** After these passes, the items deliberately _forwarded_ (not unresolved) are the concrete perceptual thresholds and the visual realization of each motion-meaning — owned by implementation batches under this document's law, tuned with real users, never fabricated. No doctrine-level weakness remained. This document is fit to govern Atlas's experience of time for years, subject to the Spec's amendment process.

---

_End of D.3 — Honest Process & Motion. This is product doctrine, subordinate to the Spec, D.1, and D.2, and superior to any individual design, ticket, or prompt. It is the permanent reference for how Atlas behaves while work is happening._
