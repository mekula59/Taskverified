import type { Task } from "@/features/shared/types/domain";

type ClaimSlotSource = Pick<Task, "claimCount" | "claimLimit">;

function slotLabel(count: number) {
  return count === 1 ? "slot" : "slots";
}

export function getRemainingClaimSlots(source: ClaimSlotSource) {
  return Math.max(source.claimLimit - source.claimCount, 0);
}

export function formatClaimAvailability(source: ClaimSlotSource) {
  const remaining = getRemainingClaimSlots(source);

  if (remaining === 0) {
    return `All ${source.claimLimit} ${slotLabel(source.claimLimit)} claimed`;
  }

  return `${remaining} of ${source.claimLimit} ${slotLabel(source.claimLimit)} available`;
}

export function formatClaimProgress(source: ClaimSlotSource) {
  return `${source.claimCount} of ${source.claimLimit} worker ${slotLabel(source.claimLimit)} claimed`;
}
