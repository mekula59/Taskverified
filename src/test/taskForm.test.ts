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
      proofRequirementsText: "Screenshot of completed account state\nSummary mapping evidence to each onboarding step",
      claimLimit: "3",
      rewardAmount: "25",
      rewardCurrency: "USD",
      deadlineAt: "2026-04-20",
      status: "open",
    });

    expect(input.title).toBe("Test task");
    expect(input.proofRequirements).toEqual(["Screenshot of completed account state", "Summary mapping evidence to each onboarding step"]);
    expect(input.claimLimit).toBe(3);
    expect(input.rewardAmount).toBe(25);
    expect(input.rewardCurrency).toBe("USD");
    expect(input.deadlineAt).toContain("2026-04-20");
  });

  it("keeps the reward reference currency locked to USD", () => {
    const input = toTaskCreateInput({
      title: "Reference value task",
      description: "Proof-based task with a USD reference value.",
      category: "testing",
      proofRequirementsText: "Screenshot of completed account state\nDevice and browser details used during the test",
      claimLimit: "1",
      rewardAmount: "25",
      rewardCurrency: "USD",
      deadlineAt: "2026-04-20",
      status: "open",
    });

    expect(input.rewardCurrency).toBe("USD");
  });

  it("rejects invalid worker slot counts", () => {
    ["", "0", "-1", "1.5", "abc", "51"].forEach((claimLimit) => {
      const errors = validateTaskForm({
        ...defaultTaskFormValues,
        title: "Test onboarding flow",
        description: "Complete onboarding and document each visible state.",
        category: "testing",
        proofRequirementsText: "Screenshot of completed account state\nDevice and browser details used during the test",
        claimLimit,
        rewardAmount: "25",
        deadlineAt: "2026-04-20",
      });

      expect(errors.claimLimit).toBe("Worker slots must be a whole number from 1 to 50.");
    });
  });

  it("accepts a valid worker slot count", () => {
    const errors = validateTaskForm({
      ...defaultTaskFormValues,
      title: "Test onboarding flow",
      description: "Complete onboarding and document each visible state.",
      category: "testing",
      proofRequirementsText: "Screenshot of completed account state\nDevice and browser details used during the test",
      claimLimit: "50",
      rewardAmount: "25",
      deadlineAt: "2026-04-20",
    });

    expect(errors.claimLimit).toBeUndefined();
  });

  it("rejects vague standalone proof requirements", () => {
    const errors = validateTaskForm({
      ...defaultTaskFormValues,
      title: "Test task",
      description: "Complete the work and submit evidence.",
      category: "testing",
      proofRequirementsText: "screenshot\ndone",
      rewardAmount: "25",
      deadlineAt: "2026-04-20",
    });

    expect(errors.proofRequirementsText).toContain("specific proof requirements");
  });

  it("accepts two specific proof requirements", () => {
    const errors = validateTaskForm({
      ...defaultTaskFormValues,
      title: "Test onboarding flow",
      description: "Complete onboarding and document each visible state.",
      category: "testing",
      proofRequirementsText: "Screenshot of completed account state\nDevice and browser details used during the test",
      rewardAmount: "25",
      deadlineAt: "2026-04-20",
    });

    expect(errors.proofRequirementsText).toBeUndefined();
  });

  it("accepts one structured proof requirement with enough review detail", () => {
    const errors = validateTaskForm({
      ...defaultTaskFormValues,
      title: "Verify event attendance",
      description: "Attend the event and submit a reviewable proof package.",
      category: "community",
      proofRequirementsText:
        "Submit one proof package containing the attendance code, timestamped screenshot, and a five-sentence summary of the discussion so the poster can verify attendance.",
      rewardAmount: "18",
      deadlineAt: "2026-04-20",
    });

    expect(errors.proofRequirementsText).toBeUndefined();
  });
});
