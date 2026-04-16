import type { TaskCreateInput, TaskFormValues, TaskValidationErrors } from "@/features/shared/types/domain";

export const defaultTaskFormValues: TaskFormValues = {
  title: "",
  description: "",
  category: "",
  proofRequirementsText: "",
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

export function toTaskCreateInput(values: TaskFormValues): TaskCreateInput {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category,
    proofRequirements: parseProofRequirements(values.proofRequirementsText),
    rewardAmount: Number(values.rewardAmount),
    rewardCurrency: values.rewardCurrency,
    deadlineAt: new Date(values.deadlineAt).toISOString(),
    status: values.status,
  };
}
