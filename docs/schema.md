# Schema Notes

## Core Entities

### User
- `id`
- `role` (`worker` | `poster`)
- `email`
- `display_name`
- `created_at`

### VerificationProfile
- `id`
- `user_id`
- `status` (`unverified` | `pending` | `verified` | `flagged`)
- `review_notes`
- `verified_at`

### ReputationProfile
- `id`
- `user_id`
- `score`
- `approval_rate`
- `completed_count`
- `flags_count`
- `updated_at`

### Task
- `id`
- `poster_id`
- `title`
- `description`
- `reward_amount`
- `reward_currency`
- `claim_limit`
- `claim_count`
- `proof_requirements`
- `status` (`draft` | `open` | `claimed` | `submitted` | `reviewed` | `paid` | `cancelled`)
- `deadline_at`
- `created_at`

### TaskClaim
- `id`
- `task_id`
- `worker_id`
- `status` (`active` | `submitted` | `withdrawn` | `expired`)
- `claimed_at`
- `submitted_at`

### Submission
- `id`
- `task_claim_id`
- `task_id`
- `worker_id`
- `proof_text`
- `proof_links`
- `proof_attachments`
- `status` (`draft` | `submitted` | `revision_requested` | `approved` | `rejected`)
- `submitted_at`
- `reviewed_at`

### SubmissionReview
- `id`
- `submission_id`
- `reviewer_id`
- `decision` (`approved` | `rejected` | `revision_requested` | `escalated`)
- `notes`
- `created_at`

### Payout
- `id`
- `task_id`
- `task_claim_id`
- `worker_id`
- `amount`
- `currency`
- `status` (`pending` | `processing` | `paid` | `held` | `failed`)
- `created_at`
- `completed_at`

### ReputationEvent
- `id`
- `user_id`
- `source_type`
- `source_id`
- `event_type`
- `score_delta`
- `created_at`

## Modeling Notes
- Reputation should derive from actual review and completion events.
- Verification status should gate worker claim eligibility.
- Payout state should be downstream from approved proof.
- Task, claim, submission, review, payout, and reputation records should remain auditable.
