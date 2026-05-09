import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { AuthContext, type AuthContextValue } from "@/features/auth/context/AuthContext";
import { AppFrame } from "@/components/shell/AppFrame";
import type { AppArea, UserRole } from "@/features/shared/types/domain";

function makeAuthValue(role: UserRole | null): AuthContextValue {
  const isAuthenticated = Boolean(role);

  return {
    user: role
      ? {
          id: `${role}-user`,
          email: `${role}@taskverified.test`,
          role,
          createdAt: "2026-05-09T00:00:00.000Z",
        }
      : null,
    profile: role
      ? {
          userId: `${role}-user`,
          fullName: `${role} user`,
          role,
          location: "Lagos",
          bio: "TaskVerified tester",
          setupCompletedAt: "2026-05-09T00:00:00.000Z",
        }
      : null,
    verification: null,
    isAuthenticated,
    isLoading: false,
    error: null,
    needsRoleSelection: false,
    needsProfileSetup: false,
    signInWithEmail: vi.fn().mockResolvedValue(undefined),
    signUpWithEmail: vi.fn().mockResolvedValue(undefined),
    signInWithWallet: vi.fn().mockResolvedValue(role ? `/${role}` : "/onboarding/role"),
    chooseRole: vi.fn().mockResolvedValue(undefined),
    saveProfile: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    routeForRole: (nextRole?: UserRole | null) => {
      if (nextRole === "worker") return "/worker";
      if (nextRole === "poster") return "/poster";
      return "/onboarding/role";
    },
  };
}

function renderAppFrame({ area, path, role }: { area: AppArea; path: string; role: UserRole | null }) {
  render(
    <AuthContext.Provider value={makeAuthValue(role)}>
      <MemoryRouter initialEntries={[path]}>
        <AppFrame area={area} />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("AppFrame navigation", () => {
  beforeEach(() => {
    Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps signed-out Tasks pointed at the public task directory", () => {
    renderAppFrame({ area: "public", path: "/tasks", role: null });

    const taskLinks = screen.getAllByRole("link", { name: "Tasks" });

    expect(taskLinks).toHaveLength(2);
    expect(taskLinks.every((link) => link.getAttribute("href") === "/tasks")).toBe(true);
    expect(taskLinks.every((link) => link.getAttribute("aria-current") === "page")).toBe(true);
    expect(screen.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign out" })).not.toBeInTheDocument();
  });

  it("routes signed-in worker Tasks to the actionable worker task page", () => {
    renderAppFrame({ area: "worker", path: "/worker/tasks", role: "worker" });

    const taskLinks = screen.getAllByRole("link", { name: "Tasks" });
    const workspaceLinks = screen.getAllByRole("link", { name: "Workspace" });

    expect(taskLinks.every((link) => link.getAttribute("href") === "/worker/tasks")).toBe(true);
    expect(taskLinks.filter((link) => link.getAttribute("aria-current") === "page")).toHaveLength(2);
    expect(workspaceLinks.every((link) => link.getAttribute("aria-current") === "page")).toBe(true);
  });

  it("routes signed-in poster Tasks to the actionable poster task page", () => {
    renderAppFrame({ area: "poster", path: "/poster/tasks", role: "poster" });

    const taskLinks = screen.getAllByRole("link", { name: "Tasks" });
    const workspaceLinks = screen.getAllByRole("link", { name: "Workspace" });

    expect(taskLinks.every((link) => link.getAttribute("href") === "/poster/tasks")).toBe(true);
    expect(taskLinks.filter((link) => link.getAttribute("aria-current") === "page")).toHaveLength(2);
    expect(workspaceLinks.every((link) => link.getAttribute("aria-current") === "page")).toBe(true);
  });
});
