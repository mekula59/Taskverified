import type { SubmissionInput, Task, TaskClaim, TaskCreateInput, TaskStoreSnapshot, TaskSubmission } from "@/features/shared/types/domain";

export function createTaskRecord(current: TaskStoreSnapshot, input: TaskCreateInput, currentUser: { id: string; name: string }): TaskStoreSnapshot {
  const task: Task = {
    id: `task-${Date.now()}`,
    posterId: currentUser.id,
    posterName: currentUser.name,
    title: input.title,
    description: input.description,
    category: input.category,
    proofRequirements: input.proofRequirements,
    rewardAmount: input.rewardAmount,
    rewardCurrency: input.rewardCurrency,
    deadlineAt: input.deadlineAt,
    status: input.status,
    claimLimit: 1,
    claimCount: 0,
    createdAt: new Date().toISOString(),
  };

  return {
    ...current,
    tasks: [task, ...current.tasks],
  };
}

export function claimTaskRecord(current: TaskStoreSnapshot, input: { taskId: string; workerId: string; workerName: string }): TaskStoreSnapshot {
  const alreadyClaimed = current.claims.some((claim) => claim.taskId === input.taskId && claim.workerId === input.workerId);
  if (alreadyClaimed) {
    return current;
  }

  const nextTasks = current.tasks.map((task) =>
    task.id === input.taskId
      ? {
          ...task,
          claimCount: task.claimCount + 1,
          status: "claimed" as const,
        }
      : task,
  );

  const nextClaim: TaskClaim = {
    id: `claim-${Date.now()}`,
    taskId: input.taskId,
    workerId: input.workerId,
    workerName: input.workerName,
    status: "active",
    claimedAt: new Date().toISOString(),
  };

  return {
    ...current,
    tasks: nextTasks,
    claims: [nextClaim, ...current.claims],
  };
}

export function submitProofRecord(current: TaskStoreSnapshot, input: SubmissionInput): TaskStoreSnapshot {
  const now = new Date().toISOString();

  const existingSubmission = current.submissions.find((submission) => submission.claimId === input.claimId);
  const nextSubmission: TaskSubmission = {
    id: existingSubmission?.id ?? `submission-${Date.now()}`,
    claimId: input.claimId,
    taskId: input.taskId,
    workerId: input.workerId,
    proofText: input.proofText,
    proofLink: input.proofLink,
    proofFileName: input.proofFileName,
    checklistItems: input.checklistItems,
    status: "submitted",
    updatedAt: now,
    submittedAt: now,
  };

  return {
    tasks: current.tasks.map((task) =>
      task.id === input.taskId
        ? {
            ...task,
            status: "submitted",
          }
        : task,
    ),
    claims: current.claims.map((claim) =>
      claim.id === input.claimId
        ? {
            ...claim,
            status: "submitted",
            submittedAt: now,
          }
        : claim,
    ),
    submissions: existingSubmission
      ? current.submissions.map((submission) => (submission.claimId === input.claimId ? nextSubmission : submission))
      : [nextSubmission, ...current.submissions],
  };
}
