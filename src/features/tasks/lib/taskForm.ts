import type { TaskCreateInput, TaskFormValues, TaskValidationErrors } from "@/features/shared/types/domain";

const vagueProofRequirements = new Set(["proof", "screenshot", "done", "submit proof", "send screenshot"]);

export const defaultTaskFormValues: TaskFormValues = {
  title: "",
  description: "",
  category: "",
  proofRequirementsText: "",
  claimLimit: "1",
  rewardAmount: "",
  rewardCurrency: "USD",
  deadlineAt: "",
  status: "open",
};

export function validateTaskForm(values: TaskFormValues): TaskValidationErrors {
  const errors: TaskValidationErrors = {};

  if (!values.title.trim()) {
    errors.title = "Title is required.";
  }

  if (!values.description.trim()) {
    errors.description = "Description is required.";
  }

  if (!values.category) {
    errors.category = "Category is required.";
  }

  const proofItems = parseProofRequirements(values.proofRequirementsText);
  if (proofItems.length === 0) {
    errors.proofRequirementsText = "At least one proof requirement is required.";
  } else if (!hasReviewableProofRequirements(proofItems)) {
    errors.proofRequirementsText =
      "Add at least two specific proof requirements, or one structured requirement with enough detail to review. Avoid standalone items like proof, screenshot, done, submit proof, or send screenshot.";
  }

  const claimLimit = Number(values.claimLimit);
  if (!values.claimLimit.trim() || !Number.isInteger(claimLimit) || claimLimit < 1 || claimLimit > 50) {
    errors.claimLimit = "Worker slots must be a whole number from 1 to 50.";
  }

  const amount = Number(values.rewardAmount);
  if (!values.rewardAmount.trim() || Number.isNaN(amount) || amount <= 0) {
    errors.rewardAmount = "Reward amount must be greater than zero.";
  }

  if (!values.deadlineAt) {
    errors.deadlineAt = "Deadline is required.";
  }

  if (!values.status) {
    errors.status = "Status is required.";
  }

  return errors;
}

export function parseProofRequirements(text: string) {
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProofRequirement(item: string) {
  return item
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function isSpecificProofRequirement(item: string) {
  const normalized = normalizeProofRequirement(item);
  const wordCount = normalized.split(" ").filter(Boolean).length;

  if (vagueProofRequirements.has(normalized)) {
    return false;
  }

  return normalized.length >= 18 && wordCount >= 3;
}

function isStructuredSingleRequirement(item: string) {
  const normalized = normalizeProofRequirement(item);
  const wordCount = normalized.split(" ").filter(Boolean).length;

  return normalized.length >= 80 && wordCount >= 10 && !vagueProofRequirements.has(normalized);
}

function hasReviewableProofRequirements(items: string[]) {
  if (items.length === 1) {
    return isStructuredSingleRequirement(items[0]);
  }

  return items.every(isSpecificProofRequirement) && items.length >= 2;
}

export function toTaskCreateInput(values: TaskFormValues): TaskCreateInput {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category,
    proofRequirements: parseProofRequirements(values.proofRequirementsText),
    claimLimit: Number(values.claimLimit),
    rewardAmount: Number(values.rewardAmount),
    rewardCurrency: values.rewardCurrency,
    deadlineAt: new Date(values.deadlineAt).toISOString(),
    status: values.status,
  };
}
