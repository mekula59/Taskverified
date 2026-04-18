# TaskVerified

TaskVerified is a proof-first micro-work product for small operational jobs that still need a real human in the loop.

The core idea is simple: posters define tightly scoped work with explicit proof requirements, workers submit evidence instead of vague completion claims, posters review against that evidence, and approved work moves into a visible payout release flow on Solana.

## Why This Matters

Most lightweight task products are weak at the exact point where trust matters:
- the work is underspecified
- proof is inconsistent
- review is opaque
- payout feels disconnected from the actual decision

TaskVerified is built to make that loop legible.

## Core Product Loop

1. A poster creates a task with a reward, deadline, and proof requirements.
2. A verified worker claims the task.
3. The worker submits a proof package: narrative, artifact link, file placeholder, and checklist coverage.
4. The poster reviews the submission against the stated proof bar.
5. Approved work advances into payout state.
6. The poster releases the payout with the correct wallet on Solana devnet.
7. The product writes the result back into visible payout and trust state.

## Why Solana

Solana is not the product story. It is the payout infrastructure.

It matters here because the product is about small units of work, and small units of work need:
- low-friction settlement
- explicit wallet custody
- a visible release moment after review

In TaskVerified, Solana shows up where it is actually useful: payout destination, poster release signature, and visible completion state.

## What Is Real Today

The current repo contains a working product loop across these areas:
- public task discovery and product story
- email and Phantom entry points into the app
- role selection and profile setup
- poster task creation
- worker task claiming
- worker proof submission
- poster review decisions
- poster payout release flow on Solana devnet
- worker and poster payout visibility
- trust / reputation state updates tied to product behavior

The app is organized into four product areas:
- `public`
- `worker`
- `poster`
- `shared`

## What Is Directional

These are product directions, not claims of fully finished production scope:
- stronger trust policy and review tooling
- richer submission artifact handling
- cleaner payout recovery and release operations
- deeper poster and worker reputation interpretation
- more polished Frontier demo hierarchy across the key decision moments

## Demo-Ready Surfaces

If you are reviewing the current product, the most important routes are:
- `/tasks`
- `/worker/tasks`
- `/worker/submissions`
- `/worker/payouts`
- `/poster/reviews`
- `/poster/payouts`

These are the surfaces that show whether the loop reads as credible end to end.

## Local Development

- Install dependencies: `npm install`
- Start the app: `npm run dev`
- Run tests: `npm test`

## Submission Framing

TaskVerified should be judged on whether it makes a trust-sensitive work loop feel operationally real:
- the work is clearly scoped
- the proof bar is explicit
- the review decision has consequence
- payout follows the decision
- Solana is used as infrastructure, not decoration
