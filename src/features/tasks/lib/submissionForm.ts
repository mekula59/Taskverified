import type { SubmissionFormValues, SubmissionInput, SubmissionValidationErrors, TaskSubmission } from "@/features/shared/types/domain";

const minimumProofNarrativeLength = 20;

export function createSubmissionFormValues(requirements: string[], existing?: TaskSubmission): SubmissionFormValues {
  if (existing) {
    return {
      proofText: existing.proofText,
      proofLink: existing.proofLink,
      proofFileName: existing.proofFileName,
      checklistItems: existing.checklistItems,
    };
  }

  return {
    proofText: "",
    proofLink: "",
    proofFileName: "",
    checklistItems: requirements.map((label) => ({ label, completed: false })),
  };
}

export function validateSubmissionForm(values: SubmissionFormValues): SubmissionValidationErrors {
  const errors: SubmissionValidationErrors = {};

  if (values.proofText.trim().length < minimumProofNarrativeLength) {
    errors.proofText = "Add enough detail for the poster to review this against the proof requirements.";
  }

  if (!values.proofLink.trim() && !values.proofFileName.trim()) {
    errors.proofArtifact = "Add a proof link or file placeholder so the poster has a direct artifact to review.";
  }

  if (values.checklistItems.some((item) => !item.completed)) {
    errors.checklistItems = "Complete every proof requirement before submitting.";
  }

  return errors;
}

export function toSubmissionInput(input: {
  claimId: string;
  taskId: string;
  workerId: string;
  values: SubmissionFormValues;
}): SubmissionInput {
  return {
    claimId: input.claimId,
    taskId: input.taskId,
    workerId: input.workerId,
    proofText: input.values.proofText.trim(),
    proofLink: input.values.proofLink.trim(),
    proofFileName: input.values.proofFileName.trim(),
    checklistItems: input.values.checklistItems,
  };
}
