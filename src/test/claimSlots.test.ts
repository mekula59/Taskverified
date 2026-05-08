import { describe, expect, it } from "vitest";

import { formatClaimAvailability, formatClaimProgress } from "@/features/tasks/lib/claimSlots";

describe("claim slot formatting", () => {
  it("formats available worker slots", () => {
    expect(formatClaimAvailability({ claimCount: 0, claimLimit: 1 })).toBe("1 of 1 slot available");
    expect(formatClaimAvailability({ claimCount: 3, claimLimit: 5 })).toBe("2 of 5 slots available");
  });

  it("formats filled worker slots", () => {
    expect(formatClaimAvailability({ claimCount: 1, claimLimit: 1 })).toBe("All 1 slot claimed");
    expect(formatClaimAvailability({ claimCount: 5, claimLimit: 5 })).toBe("All 5 slots claimed");
  });

  it("formats poster claim progress", () => {
    expect(formatClaimProgress({ claimCount: 2, claimLimit: 5 })).toBe("2 of 5 worker slots claimed");
  });
});
