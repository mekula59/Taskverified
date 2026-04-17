import { createContext } from "react";

import type { AuthState, SessionUser, UserRole, UserProfile, VerificationRecord } from "@/features/shared/types/domain";

export interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsRoleSelection: boolean;
  needsProfileSetup: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signUpWithEmail: (email: string) => Promise<void>;
  signInWithWallet: (input: { walletAddress: string; signMessage: (message: Uint8Array) => Promise<Uint8Array> }) => Promise<string>;
  chooseRole: (role: UserRole) => Promise<void>;
  saveProfile: (input: { fullName: string; location: string; bio: string }) => Promise<void>;
  signOut: () => Promise<void>;
  routeForRole: (role?: UserRole | null) => string;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
