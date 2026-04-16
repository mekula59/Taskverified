# TaskVerified Project Brief

## Product
TaskVerified is a human-verified micro-work platform for startups and communities.

## Core MVP Loop
1. Create task
2. Claim task
3. Submit proof
4. Review
5. Payout
6. Reputation update

## Product Boundaries
- Keep the product focused on trust, proof, payout, verification, and reputation.
- Do not turn this into a generic freelance marketplace.
- Do not add chat, tokenomics, social feed, DAO features, or unrelated community mechanics.
- Treat proof submission and review as core operational primitives.
- Keep worker verification and poster accountability visible in the product structure.

## Current Cleanup Goal
- Audit the Lovable starter.
- Preserve useful visual quality where it helps.
- Remove confusing generated structure and dead UI surface.
- Stabilize routing and folder boundaries before real implementation starts.
- Leave the repo narrow, reversible, and easy to build on.

## Recommended Product Areas
- `public`: landing, task discovery, auth entry points
- `worker`: claiming, submissions, payouts, reputation
- `poster`: task creation, task management, proof review, payout release
- `shared`: verification and settings

## Implementation Principle
This pass should only provide a stable app shell and planning artifacts. It should not pretend backend flows already exist.
