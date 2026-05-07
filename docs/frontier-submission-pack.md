# TaskVerified Frontier Submission Pack

## One-Line Pitch

TaskVerified turns micro-work into a proof, review, and poster-released payout loop backed by Solana.

## 30-Second Pitch

TaskVerified is a trust-first product for small work that still needs human judgment. A poster creates a task with explicit proof requirements, a verified worker claims it, submits evidence, and the poster reviews that proof against the original bar. When proof is approved, the payout enters a visible poster-controlled release flow backed by Solana, and the worker can see the released transaction and reputation impact. The goal is not to make another generic task board; it is to make proof, review, wallet identity, payout release, and trust state legible end to end.

## Two-Minute Demo Script

1. Open the public homepage and state the thesis: TaskVerified is proof-first micro-work with review before payout release.
2. Open `/tasks` and show that tasks are presented as work objects with reward, claim state, deadline, proof requirements, and release model.
3. Sign in as the poster profile, TaskVerified Labs, using Phantom.
4. Open `/poster/tasks/new` and create a small task with a reward, deadline, and concrete proof requirements.
5. Switch to the worker profile, Nadia Cole, using the linked worker Phantom wallet.
6. Open `/worker/tasks`, refresh if needed, and show that the fresh open task is visible with proof requirements before claim.
7. Claim the task and land in the proof submission flow.
8. Submit proof with a short narrative, evidence link, file placeholder, and checklist confirmation.
9. Switch back to the poster profile and open `/poster/reviews`.
10. Show the submitted proof, the proof bar, and the copy that approving creates a release obligation.
11. Approve the submission once.
12. Open `/poster/payouts`, show that the payout is ready to release, and note that release is poster-controlled in this build, not escrow.
13. Sign and release the payout with Phantom.
14. Show the released state and transaction signature on the poster payout page.
15. Switch back to the worker and open `/worker/payouts` to show the released payout and tx signature.
16. Open `/worker/reputation` to show that trust state updates from reviewed proof and released payout outcomes.
17. Open `/app/settings` to show identity, role, linked TaskVerified wallet, connected Phantom wallet, match state, release model, escrow status, and support/dispute status.

## Why Solana

Solana is payout infrastructure for TaskVerified, not the product's marketing layer.

TaskVerified uses Solana where the workflow needs an explicit release moment: wallet identity, destination visibility, poster signing, devnet transfer, transaction signature, and released payout state. Micro-work has small rewards and frequent settlement points, so low-friction transfer infrastructure matters. The product still keeps judgment off-chain: the task, proof, review, and trust consequences are product-level workflow decisions. Solana is used to make the payout release legible and verifiable after review.

## Known Limitations

- Escrow is planned for the next release model.
- Payout release is poster-controlled after proof approval in the current build.
- Proof history and payout records keep the review trail visible while dispute handling is being formalized.
- Submission artifacts are represented through proof narrative, evidence link, checklist coverage, and file placeholder rather than production-grade file custody.
- Reputation is outcome-linked for the verified loop, but it is not a complete fraud model.
- The current build is Frontier-ready, not production-ready for untrusted public money flow.
- Wallet linking and mismatch guards are explicit, but broader account recovery and session security controls are future production work.
- The product intentionally avoids tokenomics, marketplace expansion, chat, and social mechanics.

## Demo Checklist

- Poster signs in with the TaskVerified Labs Phantom wallet.
- Worker signs in with the Nadia Cole Phantom wallet.
- Poster identity maps to TaskVerified Labs.
- Worker identity maps to Nadia Cole.
- Settings shows linked TaskVerified wallet and currently connected Phantom wallet.
- Poster creates a fresh task with a proof bar.
- Worker sees the fresh open task.
- Worker claims the task.
- Worker submits proof.
- Poster sees submitted proof in reviews.
- Poster approves proof once.
- Poster payout state becomes ready to release.
- Poster signs and releases the payout through the Solana-backed release flow.
- Payout becomes released and shows a transaction signature.
- Worker sees released payout and transaction signature.
- Worker reputation/trust state updates from the completed loop.
- Sign out is available and works from signed-in surfaces.
- Signed-in users do not see public sign-in/get-started calls to action.
- Signed-out users do not see settings/sign-out controls.

## Screenshot And Video Evidence List

Recommended screenshots:

- `/` homepage: proof-first positioning and current release model language.
- `/tasks`: public task examples with reward, proof requirements, claim state, and release model.
- `/signin`: compact wallet-first entry.
- `/signup`: compact wallet-first onboarding.
- `/poster/tasks/new`: task creation with proof requirements.
- `/poster/reviews`: submitted proof and approval obligation language.
- `/poster/payouts`: poster-controlled release state and released transaction.
- `/worker/tasks`: worker claim surface with proof requirements before claim.
- `/worker/submissions`: proof state, released/approved/submitted status, and transaction visibility where data exists.
- `/worker/payouts`: released payout records with wallet and transaction signature.
- `/worker/reputation`: outcome-linked trust/reputation update.
- `/app/settings`: identity, role, linked wallet, connected wallet, match state, release model, escrow status, and support/dispute status.

Recommended video flow:

- Start public: homepage -> `/tasks`.
- Poster session: sign in -> create task.
- Worker session: sign in -> claim -> submit proof.
- Poster session: review -> approve -> release payout.
- Worker session: payouts -> reputation -> settings.

## Final Setup And Run Instructions

Prerequisites:

- Node.js compatible with the project dependencies.
- npm.
- Supabase environment configured for the TaskVerified project.
- Vercel environment variables set:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_SITE_URL`
- Phantom wallet installed for the live wallet walkthrough.
- Solana devnet wallet funds available for release testing.

Supabase auth checklist:

- Email provider enabled.
- New user signups enabled if email signup is supported.
- Redirect URLs include:
  - `https://www.taskverified.xyz/auth/callback`
  - `https://taskverified.xyz/auth/callback`
  - `https://trusty-tasks.vercel.app/auth/callback`
- Site URL set to the production domain.
- Production SMTP recommended before wider public use.
- Magic links opened in the same browser and device where they were requested. If a reviewer opens the email on another device or browser, request a new link there.

Deployment note:

- `vercel.json` rewrites client-side routes to `/index.html` so direct URLs such as `/signup`, `/auth/callback`, `/worker`, and `/poster` load the React app.
- Browser-initiated email links redirect back to the current app origin. Keep all live domains in the Supabase redirect allowlist, and use the custom domain as the primary domain once it is ready.

Local commands:

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm test
npm run lint
npm run build
```

Preview production build:

```bash
npm run build
npm run preview
```

Demo notes:

- Use the prepared poster and worker identities for the live loop.
- Keep the release model truthful: poster-released payout after approved proof.
- Do not describe the current build as escrow.
- Do not present TaskVerified as a generic marketplace.
- Keep the narrative focused on proof, review, release, wallet identity, and earned trust state.
