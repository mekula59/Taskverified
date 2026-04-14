export type UserRole = 'worker' | 'poster';

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export type TaskStatus = 'open' | 'claimed' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed' | 'expired';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';

export type TaskCategory = 'testing' | 'research' | 'content' | 'community' | 'data' | 'design';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Profile {
  userId: string;
  bio: string;
  location?: string;
  skills: string[];
  verificationStatus: VerificationStatus;
  tasksCompleted: number;
  approvalRate: number;
  totalEarnings: number;
  tasksPosted: number;
  payoutsCompleted: number;
  avgApprovalSpeed: string;
  categoryStrengths: { category: TaskCategory; count: number }[];
  reputationScore: number;
  joinedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  proofRequirements: string[];
  rewardAmount: number;
  rewardCurrency: string;
  deadline: string;
  status: TaskStatus;
  posterId: string;
  posterName: string;
  claimedBy?: string;
  createdAt: string;
  claimsCount: number;
  maxClaims: number;
}

export interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  workerId: string;
  workerName: string;
  proofText: string;
  proofLink?: string;
  proofFileUrl?: string;
  checklistItems: { label: string; completed: boolean }[];
  reviewerNotes?: string;
  reviewStatus: ReviewStatus;
  submittedAt: string;
  reviewedAt?: string;
}

export interface PayoutRecord {
  id: string;
  taskId: string;
  taskTitle: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface ReputationEvent {
  id: string;
  type: 'task_completed' | 'task_approved' | 'task_rejected' | 'verification_passed' | 'streak_bonus';
  description: string;
  points: number;
  createdAt: string;
}
