# TaskVerified

TaskVerified is a proof-first micro-work product for small operational jobs that still need a real human in the loop.

The core idea is simple: posters define tightly scoped work with explicit proof requirements, workers submit evidence instead of vague completion claims, posters review against that evidence, and approved work moves into a visible payout release flow on Solana.

One-line pitch: TaskVerified turns micro-work into a proof, review, and poster-released payout loop backed by Solana.

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

The current release model is explicit: payout release is poster-controlled after approved proof, with escrow planned for a later release model.

## What Is Real Today

The current repo contains a working product loop across these areas:
- public task discovery and product story
- email and Phantom entry points into the app
- role selection and profile setup
- poster task creation
- worker task claiming
- worker proof submission
- poster review decisions
- poster payout release flow backed by Solana
- worker and poster payout visibility
- trust / reputation state updates tied to product behavior

The app is organized into four product areas:
- `public`
- `worker`
- `poster`
- `shared`

## Current Product Boundaries

These are explicit limitations, not hidden production claims:
- Escrow is planned for the next release model.
- Payout release is poster-controlled in the current build.
- Proof history and payout records keep the review trail visible while dispute handling is being formalized.
- Submission artifacts use proof narrative, links, checklist coverage, and file placeholders; durable file storage is not the main claim of this build.
- Reputation is outcome-linked for the verified loop, but it is not a finished anti-fraud scoring system.
- Devnet payout records are used where technical transaction evidence matters.

## Demo-Ready Surfaces

If you are reviewing the current product, the most important routes are:
- `/`
- `/tasks`
- `/signin`
- `/signup`
- `/worker/tasks`
- `/worker/submissions`
- `/worker/payouts`
- `/worker/reputation`
- `/poster/tasks/new`
- `/poster/reviews`
- `/poster/payouts`
- `/app/settings`

These are the surfaces that show whether the loop reads as credible end to end.

## Local Development

- Install dependencies: `npm install`
- Start the app: `npm run dev`
- Run tests: `npm test`
- Run lint: `npm run lint`
- Run production build: `npm run build`

Required environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL`

For production, set `VITE_SITE_URL` to the public domain so email links resolve to `/auth/callback` on the deployed app.

## Deployment Readiness

Vercel serves TaskVerified as a client-side React app. The root `vercel.json` rewrites direct client-side routes to `/index.html` so routes such as `/signup`, `/auth/callback`, `/worker`, and `/poster` load the app instead of a Vercel 404.

Before a public or Frontier walkthrough, confirm these Supabase dashboard settings:

- Email provider enabled.
- New user signups enabled if email signup is supported.
- Redirect URLs include:
  - `https://www.taskverified.xyz/auth/callback`
  - `https://taskverified.xyz/auth/callback`
  - `https://trusty-tasks.vercel.app/auth/callback`
- Site URL set to the production domain.
- Production SMTP configured or scheduled before wider public use.

## Submission Framing

TaskVerified should be judged on whether it makes a trust-sensitive work loop feel operationally real:
- the work is clearly scoped
- the proof bar is explicit
- the review decision has consequence
- payout follows the decision
- Solana is used as infrastructure, not decoration

See [`docs/frontier-submission-pack.md`](docs/frontier-submission-pack.md) for the Frontier pitch, demo script, known limitations, evidence checklist, and setup notes.
