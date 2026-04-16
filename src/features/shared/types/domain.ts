export type AppArea = "public" | "worker" | "poster" | "shared";

export type UserRole = "worker" | "poster";

export type VerificationStatus = "unverified" | "pending" | "verified" | "flagged";

export type TaskStatus = "draft" | "open" | "claimed" | "submitted" | "reviewed" | "paid";

export type ClaimStatus = "active" | "submitted" | "approved";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole | null;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  role: UserRole;
  location: string;
  bio: string;
  setupCompletedAt: string;
}

export interface VerificationRecord {
  userId: string;
  status: VerificationStatus;
  submittedAt?: string;
  reviewedAt?: string;
  notes: string;
}

export interface AuthState {
  user: SessionUser | null;
  profile: UserProfile | null;
  verification: VerificationRecord | null;
}

export interface Task {
  id: string;
  posterId: string;
  posterName: string;
  title: string;
  description: string;
  rewardAmount: number;
  rewardCurrency: string;
  proofRequirements: string[];
  claimLimit: number;
  claimCount: number;
  deadlineAt: string;
  status: TaskStatus;
  category: "testing" | "research" | "community" | "content";
}

export interface TaskClaim {
  id: string;
  taskId: string;
  workerId: string;
  workerName: string;
  status: ClaimStatus;
  submittedAt?: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}
