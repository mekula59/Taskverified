import { describe, expect, it } from "vitest";

import { defaultReviewFormValues, validateReviewForm } from "@/features/tasks/lib/reviewForm";

describe("review form helpers", () => {
  it("requires reviewer notes for rejection", () => {
    const errors = validateReviewForm({
      decision: "rejected",
      values: defaultReviewFormValues,
    });

    expect(errors.reviewerNotes).toBeTruthy();
  });

  it("allows approval without reviewer notes", () => {
    const errors = validateReviewForm({
      decision: "approved",
      values: defaultReviewFormValues,
    });

    expect(errors.reviewerNotes).toBeUndefined();
  });
});
