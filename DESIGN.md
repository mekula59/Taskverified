# TaskVerified Design Doctrine

## Purpose

TaskVerified is a trust-first task execution product built for the Solana Frontier hackathon.
It is not a generic marketplace, not a crypto spectacle, and not an admin console.
It exists to make judgment legible:

- work is claimed against an explicit proof bar
- proof is reviewed against visible requirements
- payouts are released as a deliberate operational act
- trust is earned through visible outcomes, not marketing language

This document is the design source of truth for future polish passes, audits, and agent reviews.

## 1. Product Visual Thesis

TaskVerified should feel like a premium operational instrument for judging work.

The visual system should communicate:

- consequence over activity
- credibility over excitement
- operational control over dashboard noise
- premium restraint over startup ornament

The product should look like a place where decisions matter. It should feel calm, sharp, and accountable.
The default emotional response should be: "This system takes proof and release seriously."

## 2. UI Principles

### 2.1 One dominant moment per screen

Every important page should have a single primary moment:

- homepage: why this product is credible
- auth: enter the trust system
- worker task page: decide whether to claim
- worker proof page: submit evidence that can survive review
- poster review page: judge the work
- payout page: release or hold funds
- reputation page: understand earned trust position
- verification page: understand trust eligibility

Supporting context must never compete with the primary moment.

### 2.2 Consequence before summary

Primary actions, evidence, and state transitions come before metrics, summaries, and support cards.

Correct order:

1. the consequential object
2. the decision or release control
3. the current state
4. supporting metadata
5. historical or aggregate stats

### 2.3 Show the bar, then the action

Users should see the judgment criteria before they are asked to act.

- proof requirements before claim
- proof package before submission
- evidence before approve/reject
- payout state before wallet detail

### 2.4 Fewer, stronger surfaces

The product should rely on a small number of decisive containers, not many equally weighted cards.
Each page should feel edited.

### 2.5 Operational, not theatrical

Interactions should feel deliberate and clear, never loud or gimmicky.
Motion, gradients, iconography, and color are supporting tools, not the product.

## 3. Trust-Expression Rules

Trust is expressed through structure, not slogans.

Always express trust through:

- explicit requirements
- visible review criteria
- clear task and payout states
- stable identity markers
- proof-to-outcome linkage
- earned reputation summaries tied to outcomes

Never rely on trust expression through:

- generic KPI walls
- inflated claims
- decorative security language
- repeated “trust”, “verified”, or “secure” copy with no operational anchor

Trust should be legible in the workflow itself.

## 4. Surface Priorities

### 4.1 Homepage

Priority:

1. establish product credibility immediately
2. show how proof, review, and release work together
3. communicate operational seriousness

The homepage is not a feature catalog.
It should feel like a sharp thesis with evidence.

### 4.2 Auth

Priority:

1. communicate that entry is controlled and intentional
2. make wallet-first participation feel native
3. keep the experience calm and premium

Auth should feel like entering a system of consequence, not a busy signup funnel.

### 4.3 Worker claim and proof

Priority:

1. show the proof bar
2. show what claim or submission means
3. keep trust checkpoints unmistakable

The worker flow should make standards feel visible before commitment.

### 4.4 Poster review

Priority:

1. show evidence
2. show decision consequence
3. let the poster approve or reject with confidence

Review is the core trust moment of the product.

### 4.5 Payout

Priority:

1. show what is ready to release
2. show the release action and outcome state
3. relegate wallet and metadata to support

Payout is the operational release moment, not an accounting screen.

### 4.6 Reputation and verification

Priority:

1. show what trust status means
2. show how it was earned or withheld
3. avoid admin-console aesthetics

These surfaces should feel consequential, not merely informative.

## 5. Approved UI Patterns

The following patterns are approved and should be repeated consistently.

### 5.1 Dominant action slab

A dark, high-contrast action container for the page-defining moment:

- claim checkpoint
- submit checkpoint
- approve/reject control
- payout release control

Use sparingly. There should usually be one per screen.

### 5.2 Evidence-first split layout

A two-column or weighted layout where the left side carries the consequential object and the right side carries supporting state or action context.

Examples:

- task description + proof bar
- proof composer + selected task context
- evidence workspace + decision panel
- payout queue + supporting wallet/status details

### 5.3 Proof-bar modules

Requirement lists should be visually explicit, scannable, and serious.
They should read like judgment criteria, not onboarding tips.

### 5.4 Status as product state

Statuses should read as real operational states:

- open
- active
- submitted
- approved
- rejected
- ready for release
- released
- failed

Status should be attached to the object that changed, not abstracted into distant summary cards.

### 5.5 Earned trust summary

Trust summaries are approved when they are outcome-linked:

- approval rate
- released payouts
- trust score with clear provenance
- verification status with consequence

These summaries should be compact and supporting, not the page’s main theater.

### 5.6 Controlled premium density

Pages may feel rich, but not cluttered.
Use whitespace, hierarchy, and grouped emphasis to keep the page calm even when information-dense.

## 6. Disallowed UI Patterns

The following patterns should be treated as design regressions.

### 6.1 Generic SaaS KPI strips

Do not lead with vanity metrics, seeded counters, or dashboard tiles that do not directly affect user judgment.

### 6.2 Equal-weight card grids for everything

If every element is a bordered card, nothing feels important.
Avoid tiled admin layouts on core trust surfaces.

### 6.3 Crypto theater

Do not use:

- neon chain aesthetics
- token-first visual identity
- speculative/financial hype language
- decorative wallet or blockchain icon spam

Solana is infrastructure, not the brand personality.

### 6.4 Over-explanation

Do not repeat the same product idea across multiple adjacent sections.
If the interface already demonstrates the point, reduce the copy.

### 6.5 Admin-console framing

Avoid surfaces that feel like back-office tooling:

- generic metric cards as the hero
- neutral tables without consequence hierarchy
- lifeless intros followed by support panels

### 6.6 Competing primaries

No screen should present multiple equally loud action zones.
There must be an obvious first thing to look at and first thing to do.

## 7. Copy and Tone Rules

Copy should be:

- precise
- calm
- operational
- unsentimental
- minimally persuasive

Copy should avoid:

- hype
- inspirational startup language
- crypto-native slang
- legalistic security filler
- repeated marketing claims

Preferred voice:

- "Proof is how work becomes trust."
- "Release payout."
- "Show the review bar before claim."
- "Verification clears access to claim work."

Disallowed voice:

- "Revolutionary trust layer"
- "Seamless decentralized future"
- "Empowering users with transparency"
- "Best-in-class secure infrastructure"

Rule: if a sentence sounds like pitch copy instead of product truth, cut it.

## 8. Solana Presentation Rules

Solana should be presented as payout infrastructure and wallet identity.

Allowed Solana emphasis:

- payout release state
- wallet-connected participation
- transaction signature when relevant
- explicit release consequences

Disallowed Solana emphasis:

- chain fandom
- token spectacle
- decorative “web3” cues
- jargon-heavy explanation of blockchain mechanics

Solana should read as:

- fast settlement infrastructure
- transparent release execution
- operational finality

Not as:

- the product’s personality
- a marketing motif
- a reason for visual theatrics

## 9. Auth Design Rules

Auth logic is out of scope for design work unless explicitly authorized.
Design work on auth is presentation only.

Auth should follow these rules:

- the page must feel controlled, not busy
- wallet-first entry should feel native and credible
- the form stage should be visually stable and easy to read
- the brand stage should support the decision, not overwhelm it
- the total composition should feel tighter than a normal consumer signup

Auth should not:

- feel like a marketing landing page bolted onto a form
- over-explain the product before entry
- use excessive panel payload, testimonial-style clutter, or decorative abstraction

The auth experience should say:
"You are entering a serious system where identity and trust matter."

## 10. Target Feel by Surface

### 10.1 Homepage

Should feel:

- credible within seconds
- premium but restrained
- edited, not busy
- closer to a thesis than a pitch deck

It should answer:
"Why should I trust this product to judge work and release money?"

### 10.2 Poster review

Should feel:

- evidence-first
- high consequence
- calm enough for judgment
- impossible to mistake for a generic admin queue

It should answer:
"Do I have what I need to approve or reject confidently?"

### 10.3 Payout

Should feel:

- operational
- final
- release-focused
- more like signing off than browsing metadata

It should answer:
"What is ready to release, and what happens when I do it?"

### 10.4 Worker trust and proof

Should feel:

- standards-first
- honest about the bar
- motivating through clarity, not hype
- serious enough that evidence quality matters

It should answer:
"What exactly will count, and how do I submit proof that survives review?"

### 10.5 Verification

Should feel:

- consequential
- unambiguous
- tied to product access
- not ornamental

It should answer:
"What is my verification state, and what does that permit or block?"

## 11. Design Review Heuristics

Future audits should use these checks:

1. Is there a single dominant moment on the page?
2. Does the page show the judgment bar before the action?
3. Does trust come from workflow structure rather than claims?
4. Are metrics supporting the page instead of leading it?
5. Does the page feel premium through restraint rather than decoration?
6. Does Solana read as infrastructure rather than theater?
7. Does the page avoid generic SaaS and admin-console patterns?
8. Is the copy shorter, sharper, and more operational than a normal startup product?

If the answer to several of these is no, the page is off-doctrine.

## 12. Non-Negotiables

- No generic SaaS dashboard drift
- No crypto theater
- No admin-heavy first impression
- No broad explanatory sprawl
- No auth logic changes without explicit authorization
- No page where summaries outrank the consequential object

TaskVerified should feel like a premium trust instrument for real decisions.
When in doubt, reduce noise, sharpen hierarchy, and let the workflow itself carry the credibility.
