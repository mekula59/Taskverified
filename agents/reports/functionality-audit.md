MISSION CHECK: Audited the current TaskVerified repo for real sign in and sign up behavior, Phantom auth, task creation, claim flow, proof submission, poster review, payout release, and trust/reputation updates.

VERIFIED BEHAVIOR:
- Email sign in and sign up both use Supabase OTP with `/auth/callback` handling in [src/lib/supabase/auth.ts](/Users/mekula/Documents/GitHub/trusty-tasks/src/lib/supabase/auth.ts) and [src/features/public/routes/AuthCallbackPage.tsx](/Users/mekula/Documents/GitHub/trusty-tasks/src/features/public/routes/AuthCallbackPage.tsx).
- Phantom auth uses the in-repo `auth-wallet` edge function to issue a nonce, verify the wallet signature, look up or create a wallet-linked user, and then sign in with generated email/password credentials in [supabase/functions/auth-wallet/index.ts](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/functions/auth-wallet/index.ts).
- Task creation is backed by the `create_task` SQL RPC in [supabase/migrations/202604170001_taskverified_backend_truth.sql](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/migrations/202604170001_taskverified_backend_truth.sql).
- Claiming, proof submission, review, payout release preparation, payout completion, wallet connect, and wallet disconnect all go through in-repo SQL RPCs or edge functions in [src/lib/supabase/tasks.ts](/Users/mekula/Documents/GitHub/trusty-tasks/src/lib/supabase/tasks.ts), [supabase/migrations/202604170001_taskverified_backend_truth.sql](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/migrations/202604170001_taskverified_backend_truth.sql), and [supabase/functions/complete-payout-release/index.ts](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/functions/complete-payout-release/index.ts).
- Worker reputation refresh is triggered on proof submission, review, verification update, and payout release in the SQL layer.

DEFECTS:
1. Multi-claim task behavior is broken even though the product presents claim limits as a real concept.
TYPE: logic
USER IMPACT: Posters cannot actually run a task with more than one active claimant, and workers see claim-limit messaging that the backend cannot honor.
SMALLEST SAFE FIX: Keep tasks claimable until `claim_count` reaches `claim_limit`, and stop forcing `tasks.status = 'claimed'` on the first claim; if multi-claim support is intentionally out of scope, remove claim-limit language and surface it as single-claim only.
NEEDS GOVERNOR APPROVAL: yes
Evidence:
- The schema models `claim_limit` as a real field with `claim_limit integer not null default 1` in [supabase/migrations/202604170001_taskverified_backend_truth.sql:52](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/migrations/202604170001_taskverified_backend_truth.sql:52).
- The UI tells workers that tasks expose “claim limits” before claim in [src/features/worker/routes/WorkerTasksPage.tsx:53](/Users/mekula/Documents/GitHub/trusty-tasks/src/features/worker/routes/WorkerTasksPage.tsx:53) and the public site repeats the same promise in [src/features/public/routes/HomePage.tsx:68](/Users/mekula/Documents/GitHub/trusty-tasks/src/features/public/routes/HomePage.tsx:68).
- Task creation hard-codes `claim_limit` to `1` in the backend regardless of any future product intent in [supabase/migrations/202604170001_taskverified_backend_truth.sql:706](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/migrations/202604170001_taskverified_backend_truth.sql:706).
- The first successful claim unconditionally changes the task status to `'claimed'` in [supabase/migrations/202604170001_taskverified_backend_truth.sql:804](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/migrations/202604170001_taskverified_backend_truth.sql:804).
- Later claims are blocked because `claim_task` only allows tasks whose status is `'open'` in [supabase/migrations/202604170001_taskverified_backend_truth.sql:765](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/migrations/202604170001_taskverified_backend_truth.sql:765).

2. A single poster review decision closes the entire task globally instead of just resolving the reviewed claim.
TYPE: logic
USER IMPACT: One worker’s approval or rejection can prematurely end the task for everyone else, which breaks the review loop as soon as more than one claimant is expected or later introduced.
SMALLEST SAFE FIX: Update task-level status from aggregate claim/submission state instead of writing `approved` or `rejected` directly from one submission review.
NEEDS GOVERNOR APPROVAL: yes
Evidence:
- `review_submission` updates the specific submission and claim, which is correct, in [supabase/migrations/202604170001_taskverified_backend_truth.sql:1000](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/migrations/202604170001_taskverified_backend_truth.sql:1000).
- The same function also updates the parent task status directly to `approved` or `rejected` based on that one decision in [supabase/migrations/202604170001_taskverified_backend_truth.sql:1008](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/migrations/202604170001_taskverified_backend_truth.sql:1008).
- Worker task discovery only shows tasks with public statuses from `getPublicTasks`, which excludes `approved` and `rejected`, in [src/features/tasks/data/sampleData.ts:18](/Users/mekula/Documents/GitHub/trusty-tasks/src/features/tasks/data/sampleData.ts:18).
- Claiming is also blocked once the task is no longer `'open'` in [supabase/migrations/202604170001_taskverified_backend_truth.sql:765](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/migrations/202604170001_taskverified_backend_truth.sql:765).

3. A failed payout release is effectively terminal, even though the poster UI tells the user to inspect the failure and retry.
TYPE: state-mismatch
USER IMPACT: One failed payout attempt can strand an otherwise valid approved payout in an unrecoverable failed state, which makes the release loop unreliable during demo.
SMALLEST SAFE FIX: Add a contained reset path from `failed` back to `ready_to_release` after wallet and payout checks pass again, or stop marking recoverable client-side failures as terminal.
NEEDS GOVERNOR APPROVAL: yes
Evidence:
- The poster UI says failed releases should be reviewed “before retrying” in [src/features/poster/routes/PosterPayoutsPage.tsx:204](/Users/mekula/Documents/GitHub/trusty-tasks/src/features/poster/routes/PosterPayoutsPage.tsx:204).
- The UI only renders the release button when `payout.status === "ready_to_release"` in [src/features/poster/routes/PosterPayoutsPage.tsx:177](/Users/mekula/Documents/GitHub/trusty-tasks/src/features/poster/routes/PosterPayoutsPage.tsx:177).
- On failure, the client explicitly calls `failPayoutRelease` in [src/features/poster/routes/PosterPayoutsPage.tsx:74](/Users/mekula/Documents/GitHub/trusty-tasks/src/features/poster/routes/PosterPayoutsPage.tsx:74).
- `fail_payout_release` sets the payout status to `'failed'` in [supabase/migrations/202604170001_taskverified_backend_truth.sql:1188](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/migrations/202604170001_taskverified_backend_truth.sql:1188).
- `refresh_payout_record` exits immediately for payouts already in `('released', 'failed')`, so a failed payout cannot be refreshed back into a releasable state in [supabase/migrations/202604170001_taskverified_backend_truth.sql:281](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/migrations/202604170001_taskverified_backend_truth.sql:281).
- `sync_payouts_for_user` only refreshes payouts in `('pending', 'ready_to_release')`, so reconnecting wallets cannot recover a failed payout either in [supabase/migrations/202604170001_taskverified_backend_truth.sql:329](/Users/mekula/Documents/GitHub/trusty-tasks/supabase/migrations/202604170001_taskverified_backend_truth.sql:329).
