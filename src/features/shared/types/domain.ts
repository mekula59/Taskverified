export type AppArea = "public" | "worker" | "poster" | "shared";

export type UserRole = "worker" | "poster";

export type VerificationStatus = "unverified" | "pending" | "verified" | "flagged";

export type TaskStatus = "draft" | "open" | "claimed" | "submitted" | "reviewed" | "paid";

export type ClaimStatus = "active" | "submitted" | "approved";

export type TaskCategory = "testing" | "research" | "community" | "content";

export type RewardCurrency = "USD" | "NGN";

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
  rewardCurrency: RewardCurrency;
  proofRequirements: string[];
  claimLimit: number;
  claimCount: number;
  deadlineAt: string;
  status: TaskStatus;
  category: TaskCategory;
  createdAt: string;
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

export interface TaskCreateInput {
  title: string;
  description: string;
  category: TaskCategory;
  proofRequirements: string[];
  rewardAmount: number;
  rewardCurrency: RewardCurrency;
  deadlineAt: string;
  status: TaskStatus;
}

export interface TaskFormValues {
  title: string;
  description: string;
  category: TaskCategory | "";
  proofRequirementsText: string;
  rewardAmount: string;
  rewardCurrency: RewardCurrency;
  deadlineAt: string;
  status: TaskStatus;
}

export interface TaskValidationErrors {
  title?: string;
  description?: string;
  category?: string;
  proofRequirementsText?: string;
  rewardAmount?: string;
  deadlineAt?: string;
  status?: string;
}
