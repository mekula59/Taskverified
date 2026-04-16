import { createContext } from "react";

import type { AuthState, SessionUser, UserRole, UserProfile, VerificationRecord } from "@/features/shared/types/domain";

export interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  needsRoleSelection: boolean;
  needsProfileSetup: boolean;
  signInWithEmail: (email: string) => void;
  continueDemoAsRole: (role: UserRole) => void;
  chooseRole: (role: UserRole) => void;
  saveProfile: (input: { fullName: string; location: string; bio: string }) => void;
  signOut: () => void;
  routeForRole: (role?: UserRole | null) => string;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
