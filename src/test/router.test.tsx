import { describe, expect, it } from "vitest";

import { router } from "@/app/router";

function flattenPaths(routes: typeof router.routes): string[] {
  return routes.flatMap((route) => {
    const ownPath = typeof route.path === "string" ? [route.path] : [];
    const childPaths = route.children ? flattenPaths(route.children) : [];

    return [...ownPath, ...childPaths];
  });
}

describe("router", () => {
  it("keeps public, onboarding, worker, poster, and shared route roots", () => {
    const paths = flattenPaths(router.routes);

    expect(paths).toContain("/");
    expect(paths).toContain("/onboarding");
    expect(paths).toContain("/worker");
    expect(paths).toContain("/poster");
    expect(paths).toContain("/app");
  });
});
