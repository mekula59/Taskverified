# TODO

## Current Status
- Repo structure cleaned and reorganized around `public`, `worker`, `poster`, and `shared`.
- Lovable-generated page sprawl removed in favor of a stable shell.
- Core route boundaries documented and scaffolded.
- Product docs added for sitemap, screens, and schema planning.
- Frontend-safe auth/session structure added with local persistence and clear upgrade path to Supabase.
- Role selection and profile setup flows added under onboarding routes.
- Verification now has a real status model and current-user UI.
- Task entity, sample data selectors, and worker/poster dashboard foundations added.
- Poster task creation form, validation, and frontend-safe local task storage added.
- Newly created tasks now appear in poster surfaces and shared task browsing when status makes them public.
- Worker claim flow and proof submission flow added with local persistence for claims and submissions.
- Worker dashboard and task views now reflect active claims, proof queue, and submitted state.
- Poster review flow added with approval/rejection decisions and optional rejection notes.
- Review outcomes now propagate across poster review surfaces, worker submission views, and dashboard summaries.
- Solana wallet scaffolding and Solana-shaped payout records added for workers and posters.
- Approved submissions can now become ready-to-release Solana payouts and be released with a tx signature placeholder.
- Reputation events and trust summaries now derive from verification, proof submission, review outcomes, repeat completed work, and released Solana payouts.
- Worker and poster surfaces now show typed trust context instead of placeholder reputation copy.

## Next Implementation Tasks
- Connect verification updates from the auth flow into the shared worker trust store instead of relying on seeded worker summaries.
- Replace wallet scaffolding and payout release placeholder logic with real Solana wallet connection and transfer execution.
- Replace local auth and sample data adapters with Supabase-backed queries and mutations.
- Add tests around routing, app shell rendering, and domain state transitions.

## Guardrails
- Stay inside the core MVP loop.
- Keep route names and folder boundaries stable unless there is a strong reason to change them.
- Prefer narrow, reversible changes over broad rewrites.
