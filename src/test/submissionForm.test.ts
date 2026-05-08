import { describe, expect, it } from "vitest";

import { validateSubmissionForm } from "@/features/tasks/lib/submissionForm";

const completeChecklist = [
  { label: "Screenshot of completed account state", completed: true },
  { label: "Summary mapping evidence to each onboarding step", completed: true },
];

describe("submission form helpers", () => {
  it("rejects useless proof narratives", () => {
    const errors = validateSubmissionForm({
      proofText: "done",
      proofLink: "https://example.com/proof",
      proofFileName: "",
      checklistItems: completeChecklist,
    });

    expect(errors.proofText).toBe("Add enough detail for the poster to review this against the proof requirements.");
  });

  it("requires a direct proof artifact", () => {
    const errors = validateSubmissionForm({
      proofText: "Completed the flow and mapped each screenshot to the proof requirements.",
      proofLink: "",
      proofFileName: "",
      checklistItems: completeChecklist,
    });

    expect(errors.proofArtifact).toBe("Add a proof link or file placeholder so the poster has a direct artifact to review.");
  });

  it("accepts a reviewable proof package", () => {
    const errors = validateSubmissionForm({
      proofText: "Completed the flow and mapped each screenshot to the proof requirements.",
      proofLink: "https://example.com/proof",
      proofFileName: "",
      checklistItems: completeChecklist,
    });

    expect(errors).toEqual({});
  });
});
