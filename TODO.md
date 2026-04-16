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

## Next Implementation Tasks
- Implement worker claim flow and active-claim limits.
- Implement submission flow with structured proof fields and attachment support.
- Implement poster review actions: approve, reject, request revision, escalate.
- Implement payout state machine and payout history views.
- Implement reputation event tracking tied to task outcomes.
- Replace local auth and sample data adapters with Supabase-backed queries and mutations.
- Add tests around routing, app shell rendering, and domain state transitions.

## Guardrails
- Stay inside the core MVP loop.
- Keep route names and folder boundaries stable unless there is a strong reason to change them.
- Prefer narrow, reversible changes over broad rewrites.
