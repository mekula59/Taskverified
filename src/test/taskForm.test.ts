import { describe, expect, it } from "vitest";

import { defaultTaskFormValues, parseProofRequirements, toTaskCreateInput, validateTaskForm } from "@/features/tasks/lib/taskForm";

describe("task form helpers", () => {
  it("returns validation errors for missing required fields", () => {
    const errors = validateTaskForm(defaultTaskFormValues);

    expect(errors.title).toBeTruthy();
    expect(errors.description).toBeTruthy();
    expect(errors.category).toBeTruthy();
    expect(errors.proofRequirementsText).toBeTruthy();
    expect(errors.rewardAmount).toBeTruthy();
    expect(errors.deadlineAt).toBeTruthy();
  });

  it("parses proof requirements from newline text", () => {
    expect(parseProofRequirements("One\nTwo\n\nThree")).toEqual(["One", "Two", "Three"]);
  });

  it("converts form values into a task input", () => {
    const input = toTaskCreateInput({
      title: " Test task ",
      description: " Proof-based task ",
      category: "testing",
      proofRequirementsText: "Screenshot\nSummary",
      rewardAmount: "25",
      rewardCurrency: "USD",
      deadlineAt: "2026-04-20",
      status: "open",
    });

    expect(input.title).toBe("Test task");
    expect(input.proofRequirements).toEqual(["Screenshot", "Summary"]);
    expect(input.rewardAmount).toBe(25);
    expect(input.deadlineAt).toContain("2026-04-20");
  });
});
