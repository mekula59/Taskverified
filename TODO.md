# TODO

## Current Status
- Repo structure cleaned and reorganized around `public`, `worker`, `poster`, and `shared`.
- Lovable-generated page sprawl removed in favor of a stable shell.
- Core route boundaries documented and scaffolded.
- Product docs added for sitemap, screens, and schema planning.
- Supabase-backed auth/session structure now exists as the canonical identity layer.
- Real passwordless email auth now uses Supabase magic links instead of anonymous session fallback.
- Real Phantom wallet auth now uses a backend nonce/signature verification flow and restores the same canonical user identity.
- Role selection and profile setup flows added under onboarding routes.
- Verification now has a real status model and current-user UI.
- Task entity, shared selectors, and worker/poster dashboard foundations added.
- Poster task creation form, validation, and canonical backend persistence added.
- Newly created tasks now appear in poster surfaces and shared task browsing when status makes them public.
- Worker claim flow and proof submission flow now persist to backend truth.
- Worker dashboard and task views now reflect active claims, proof queue, and submitted state.
- Poster review flow added with approval/rejection decisions and optional rejection notes.
- Review outcomes now propagate across poster review surfaces, worker submission views, and dashboard summaries.
- Solana wallet connection now syncs live Phantom addresses into backend profile and payout state.
- Approved submissions can now become backend payout records and be released through a real Phantom-signed Solana devnet transfer with confirmed tx signatures stored in Supabase.
- Reputation events and trust summaries now derive from verification, proof submission, review outcomes, repeat completed work, and released Solana payouts.
- Worker and poster surfaces now show typed trust context instead of placeholder reputation copy.
- Real Phantom-first Solana wallet connection is now wired for worker and poster payout flows, with live wallet addresses synced into local task state on devnet.
- Supabase schema and RPC mutations now define authoritative backend truth for tasks, claims, submissions, reviews, payouts, wallets, and reputation.
- The core loop now enforces invariants in the mutation layer for task creation, claim, proof submission, review, and payout release.

## Next Implementation Tasks
- Add a real verification review path so worker verification can move from `pending` to `verified` without seeding.
- Add integration coverage for Supabase RPC invariant failures and end-to-end trust-loop mutations.
- Add a wallet-balance preflight check and cleaner retry path for failed devnet payout releases.
- Add automated coverage for the auth callback and wallet sign-in edge-function flow.

## Guardrails
- Stay inside the core MVP loop.
- Keep route names and folder boundaries stable unless there is a strong reason to change them.
- Prefer narrow, reversible changes over broad rewrites.
