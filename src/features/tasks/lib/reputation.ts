import type {
  PayoutRecord,
  ReputationEvent,
  SubmissionStatus,
  Task,
  TaskCategory,
  TaskClaim,
  TaskStoreSnapshot,
  TaskSubmission,
  VerificationStatus,
  WorkerProfileSummary,
  WorkerReputationSummary,
} from "@/features/shared/types/domain";

interface ReputationSource {
  tasks: Task[];
  claims: TaskClaim[];
  submissions: TaskSubmission[];
  workerProfiles: WorkerProfileSummary[];
  payouts: PayoutRecord[];
}

function getTaskCategory(tasks: Task[], taskId: string): TaskCategory | undefined {
  return tasks.find((task) => task.id === taskId)?.category;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}

function toRate(numerator: number, denominator: number) {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
}

function getWorkerTimestamp(source: ReputationSource, workerId: string) {
  const timestamps = [
    ...source.claims.filter((claim) => claim.workerId === workerId).map((claim) => claim.claimedAt),
    ...source.submissions.filter((submission) => submission.workerId === workerId).flatMap((submission) => [submission.submittedAt, submission.reviewedAt, submission.updatedAt]),
    ...source.payouts.filter((payout) => payout.workerId === workerId).flatMap((payout) => [payout.createdAt, payout.releasedAt]),
  ].filter((value): value is string => Boolean(value));

  return timestamps.sort()[0] ?? new Date().toISOString();
}

function createEvent(input: Omit<ReputationEvent, "id">): ReputationEvent {
  return {
    ...input,
    id: [
      input.workerId,
      input.type,
      input.taskId ?? "global",
      input.claimId ?? "none",
      input.submissionId ?? "none",
      input.payoutId ?? "none",
    ].join(":"),
  };
}

function getRepeatCompletionEvents(source: ReputationSource, workerId: string): ReputationEvent[] {
  const approvedSubmissions = source.submissions
    .filter((submission) => submission.workerId === workerId && submission.status === "approved")
    .sort((left, right) => (left.reviewedAt ?? left.updatedAt).localeCompare(right.reviewedAt ?? right.updatedAt));
  const completionsByCategory = new Map<TaskCategory, number>();

  return approvedSubmissions.flatMap((submission) => {
    const category = getTaskCategory(source.tasks, submission.taskId);
    if (!category) {
      return [];
    }

    const completedCount = (completionsByCategory.get(category) ?? 0) + 1;
    completionsByCategory.set(category, completedCount);

    if (completedCount <= 1) {
      return [];
    }

    return [
      createEvent({
        workerId,
        type: "repeat_completed_work",
        detail: `Completed repeat approved work in ${category}.`,
        scoreDelta: 3,
        createdAt: submission.reviewedAt ?? submission.updatedAt,
        taskId: submission.taskId,
        claimId: submission.claimId,
        submissionId: submission.id,
        category,
      }),
    ];
  });
}

function getWorkerEvents(source: ReputationSource, worker: WorkerProfileSummary): ReputationEvent[] {
  const workerId = worker.userId;
  const events: ReputationEvent[] = [];

  if (worker.verificationStatus === "verified") {
    events.push(
      createEvent({
        workerId,
        type: "verification_completed",
        detail: "Verification completed and live work unlocked.",
        scoreDelta: 20,
        createdAt: getWorkerTimestamp(source, workerId),
      }),
    );
  }

  source.submissions
    .filter((submission) => submission.workerId === workerId && (submission.status === "submitted" || submission.status === "approved" || submission.status === "rejected"))
    .forEach((submission) => {
      events.push(
        createEvent({
          workerId,
          type: "proof_submitted",
          detail: "Proof submitted for poster review.",
          scoreDelta: 5,
          createdAt: submission.submittedAt ?? submission.updatedAt,
          taskId: submission.taskId,
          claimId: submission.claimId,
          submissionId: submission.id,
          category: getTaskCategory(source.tasks, submission.taskId),
        }),
      );

      if (submission.status === "approved") {
        events.push(
          createEvent({
            workerId,
            type: "submission_approved",
            detail: "Submitted proof approved by the poster.",
            scoreDelta: 18,
            createdAt: submission.reviewedAt ?? submission.updatedAt,
            taskId: submission.taskId,
            claimId: submission.claimId,
            submissionId: submission.id,
            category: getTaskCategory(source.tasks, submission.taskId),
          }),
        );
      }

      if (submission.status === "rejected") {
        events.push(
          createEvent({
            workerId,
            type: "submission_rejected",
            detail: "Submitted proof rejected and requires better evidence quality.",
            scoreDelta: -8,
            createdAt: submission.reviewedAt ?? submission.updatedAt,
            taskId: submission.taskId,
            claimId: submission.claimId,
            submissionId: submission.id,
            category: getTaskCategory(source.tasks, submission.taskId),
          }),
        );
      }
    });

  source.payouts
    .filter((payout) => payout.workerId === workerId && payout.status === "released")
    .forEach((payout) => {
      events.push(
        createEvent({
          workerId,
          type: "payout_released",
          detail: "Approved work reached released Solana payout state.",
          scoreDelta: 12,
          createdAt: payout.releasedAt ?? payout.createdAt,
          taskId: payout.taskId,
          claimId: payout.claimId,
          submissionId: payout.submissionId,
          payoutId: payout.id,
          category: getTaskCategory(source.tasks, payout.taskId),
        }),
      );
    });

  return [...events, ...getRepeatCompletionEvents(source, workerId)].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function getCategoryStrengths(source: ReputationSource, workerId: string) {
  const stats = new Map<TaskCategory, { approvals: number; reviewed: number }>();

  source.submissions
    .filter((submission) => submission.workerId === workerId && (submission.status === "approved" || submission.status === "rejected"))
    .forEach((submission) => {
      const category = getTaskCategory(source.tasks, submission.taskId);
      if (!category) {
        return;
      }

      const current = stats.get(category) ?? { approvals: 0, reviewed: 0 };
      stats.set(category, {
        approvals: current.approvals + (submission.status === "approved" ? 1 : 0),
        reviewed: current.reviewed + 1,
      });
    });

  return [...stats.entries()]
    .map(([category, value]) => ({
      category,
      completedCount: value.approvals,
      approvalRate: toRate(value.approvals, value.reviewed),
    }))
    .sort((left, right) => {
      if (right.completedCount !== left.completedCount) {
        return right.completedCount - left.completedCount;
      }

      return right.approvalRate - left.approvalRate;
    });
}

function getExplanation(verificationStatus: VerificationStatus, approvedCount: number, rejectedCount: number, releasedCount: number) {
  return [
    verificationStatus === "verified"
      ? "Verification contributes a strong base trust signal."
      : "Verification is still the biggest missing trust signal.",
    `${approvedCount} approved submissions and ${releasedCount} released Solana payouts reinforce delivery reliability.`,
    rejectedCount > 0
      ? `${rejectedCount} rejected submission${rejectedCount === 1 ? "" : "s"} currently soften the score.`
      : "No rejected submissions are currently dragging trust down.",
  ];
}

function buildWorkerSummary(source: ReputationSource, worker: WorkerProfileSummary, events: ReputationEvent[]): WorkerReputationSummary {
  const workerSubmissions = source.submissions.filter((submission) => submission.workerId === worker.userId);
  const reviewedSubmissions = workerSubmissions.filter(
    (submission) => submission.status === "approved" || submission.status === "rejected",
  );
  const approvedCount = reviewedSubmissions.filter((submission) => submission.status === "approved").length;
  const rejectedCount = reviewedSubmissions.filter((submission) => submission.status === "rejected").length;
  const releasedCount = source.payouts.filter((payout) => payout.workerId === worker.userId && payout.status === "released").length;
  const trustScore = clampScore(events.reduce((sum, event) => sum + event.scoreDelta, 0));

  return {
    workerId: worker.userId,
    verificationStatus: worker.verificationStatus,
    tasksCompleted: approvedCount,
    proofSubmitted: workerSubmissions.filter((submission) => submission.status !== "draft").length,
    approvals: approvedCount,
    rejections: rejectedCount,
    approvalRate: toRate(approvedCount, reviewedSubmissions.length),
    payoutsReleased: releasedCount,
    trustScore,
    categoryStrengths: getCategoryStrengths(source, worker.userId),
    updatedAt: new Date().toISOString(),
    explanation: getExplanation(worker.verificationStatus, approvedCount, rejectedCount, releasedCount),
  };
}

export function buildReputationState(source: ReputationSource) {
  const reputationEvents = source.workerProfiles.flatMap((worker) => getWorkerEvents(source, worker));
  const reputationSummaries = source.workerProfiles.map((worker) =>
    buildWorkerSummary(
      source,
      worker,
      reputationEvents.filter((event) => event.workerId === worker.userId),
    ),
  );

  return {
    reputationEvents,
    reputationSummaries,
  };
}

export function withReputation(
  snapshot: Omit<TaskStoreSnapshot, "reputationEvents" | "reputationSummaries"> | TaskStoreSnapshot,
): TaskStoreSnapshot {
  const reputation = buildReputationState(snapshot);

  return {
    ...snapshot,
    reputationEvents: reputation.reputationEvents,
    reputationSummaries: reputation.reputationSummaries,
  };
}

export function getSubmissionTrustStatus(status: SubmissionStatus) {
  if (status === "approved") {
    return "Trust confirmed";
  }

  if (status === "rejected") {
    return "Trust weakened";
  }

  return "Awaiting review";
}
