import type { ReviewFormValues, ReviewValidationErrors } from "@/features/shared/types/domain";

export const defaultReviewFormValues: ReviewFormValues = {
  reviewerNotes: "",
};

export function validateReviewForm(input: { decision: "approved" | "rejected"; values: ReviewFormValues }): ReviewValidationErrors {
  const errors: ReviewValidationErrors = {};

  if (input.decision === "rejected" && !input.values.reviewerNotes.trim()) {
    errors.reviewerNotes = "Reviewer notes are required when rejecting a submission.";
  }

  return errors;
}
