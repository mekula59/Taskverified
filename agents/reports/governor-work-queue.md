INPUTS REVIEWED:
- `agents/reports/design-audit.md`
- `agents/reports/frontier-strategy.md`
- `agents/reports/solana-qa.md`
- `agents/reports/functionality-audit.md`

REJECTED FOR DRIFT:
- Auth layout geometry recommendations from `design-audit.md`: rejected for this queue because auth is parked and the user explicitly blocked further auth UI/auth logic work.
- Any auth route/header/auth transition recommendations from `frontier-strategy.md`: rejected because they touch auth behavior or auth-adjacent structure without explicit authorization.
- Broad “remove dashboard scaffolding” rewrites from `frontier-strategy.md`: rejected as too broad. The approved queue keeps only contained, high-leverage workflow changes.
- Any implied Solana recommendations from `solana-qa.md` that are presentation-only and not backed by dedicated QA evidence: rejected as non-blocking for functionality.

FRONTIER PRIORITY RANKING:
1. Fix the live product loop blockers in task claim, review, and payout recovery.
2. Make poster review and payout release read as credible operational moments, not admin surfaces.
3. Tighten worker submission-readiness messaging so proof quality is legible before review.
4. Make README/demo framing accurately describe the real product loop.

APPROVED WORK QUEUE:
1. Fix claim-loop integrity.
Smallest safe change:
- Keep tasks claimable until `claim_count` actually reaches `claim_limit`, or explicitly collapse the product to single-claim language everywhere.
- Approved because this is a real logic defect already evidenced in the backend SQL and current UI copy.

2. Fix review-loop integrity.
Smallest safe change:
- Stop letting one submission review write the entire parent task to `approved` or `rejected`.
- Task-level state should reflect aggregate task progress, not a single claim decision.
- Approved because this is a direct product-loop correctness issue and damages Frontier credibility more than any polish work.

3. Fix payout failure recovery.
Smallest safe change:
- Add a contained recovery path so a payout marked `failed` can re-enter a releasable state when wallets and payout conditions are valid again, or stop treating recoverable client failures as terminal.
- Approved because payout credibility is Frontier-critical and the current repo evidence shows a dead-end release path.

4. Tighten poster review consequence visibility.
Smallest safe change:
- Keep the current review surface, but make proof coverage, payout consequence, and wallet dependency more explicit at the decision point.
- Approved because this improves business-plan clarity and loop comprehension without adding features.

5. Tighten poster payout credibility messaging.
Smallest safe change:
- Keep the current payout release page, but foreground the minimum release-credibility checks: approved proof, both wallets present, exact poster wallet connected, visible signature/result.
- Approved because Solana should read as payout infrastructure and operational consequence, not decorative chrome.

6. Tighten worker submission-readiness messaging.
Smallest safe change:
- Add or refine contained readiness checks so workers can see whether their narrative, artifacts, and checklist actually read as review-ready before submit.
- Approved because this improves UX and reduces avoidable review ambiguity without changing submission logic.

7. Update README and demo framing.
Smallest safe change:
- Rewrite the README so it accurately describes the actual loop: create task, claim, submit proof, review, payout release, trust update.
- Approved because the current repo should not undersell itself as mere scaffold if the product loop already exists.

BLOCKED ITEMS:
- Any auth logic changes: blocked unless explicitly authorized by the user.
- Any auth UI/layout changes: blocked for now because auth is parked.
- Any route architecture changes: blocked unless explicitly authorized by the user.
- Any broad visual rewrite of worker/poster surfaces: blocked. Only contained workflow-focused hierarchy changes are approved.
- Any claim of dedicated Solana QA completion beyond the evidence in the current reports: blocked.

IMPLEMENTATION STATUS: pending user approval
