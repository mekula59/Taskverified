import type { AuthState, UserProfile, SessionUser, VerificationRecord } from "@/features/shared/types/domain";

const STORAGE_KEY = "taskverified.auth";

const demoWorkerUser: SessionUser = {
  id: "worker-001",
  email: "worker@taskverified.demo",
  role: "worker",
  createdAt: "2026-04-01T10:00:00.000Z",
};

const demoPosterUser: SessionUser = {
  id: "poster-001",
  email: "poster@taskverified.demo",
  role: "poster",
  createdAt: "2026-04-01T10:00:00.000Z",
};

const demoWorkerProfile: UserProfile = {
  userId: demoWorkerUser.id,
  fullName: "Nadia Cole",
  role: "worker",
  location: "Lagos, NG",
  bio: "Reliable product tester focused on evidence-rich proof and on-time completion.",
  setupCompletedAt: "2026-04-02T09:00:00.000Z",
};

const demoPosterProfile: UserProfile = {
  userId: demoPosterUser.id,
  fullName: "TaskVerified Labs",
  role: "poster",
  location: "Remote",
  bio: "Startup team posting tightly scoped, proof-based tasks for product feedback and community operations.",
  setupCompletedAt: "2026-04-02T09:30:00.000Z",
};

const demoWorkerVerification: VerificationRecord = {
  userId: demoWorkerUser.id,
  status: "verified",
  submittedAt: "2026-04-03T08:00:00.000Z",
  reviewedAt: "2026-04-03T11:30:00.000Z",
  notes: "Identity and payout readiness confirmed. Eligible to claim live work.",
};

const demoPosterVerification: VerificationRecord = {
  userId: demoPosterUser.id,
  status: "pending",
  submittedAt: "2026-04-04T13:00:00.000Z",
  notes: "Organization review in progress. Posting remains available in frontend-safe mode.",
};

export const demoAuthStates: Record<"worker" | "poster", AuthState> = {
  worker: {
    user: demoWorkerUser,
    profile: demoWorkerProfile,
    verification: demoWorkerVerification,
  },
  poster: {
    user: demoPosterUser,
    profile: demoPosterProfile,
    verification: demoPosterVerification,
  },
};

export function readStoredAuthState(): AuthState {
  if (typeof window === "undefined") {
    return { user: null, profile: null, verification: null };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { user: null, profile: null, verification: null };
  }

  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return { user: null, profile: null, verification: null };
  }
}

export function writeStoredAuthState(state: AuthState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearStoredAuthState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
