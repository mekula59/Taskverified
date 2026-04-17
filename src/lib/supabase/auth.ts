import type { AuthState, SessionUser, UserRole, UserProfile, VerificationRecord } from "@/features/shared/types/domain";
import { mapVerification, type BackendProfileRow, type BackendVerificationRow } from "@/lib/supabase/mappers";
import { requireSupabase } from "@/lib/supabase/client";

const demoProfiles = {
  worker: {
    email: "worker@taskverified.demo",
    fullName: "Nadia Cole",
    location: "Lagos, NG",
    bio: "Reliable product tester focused on evidence-rich proof and on-time completion.",
    verificationStatus: "verified" as const,
    verificationNotes: "Identity and payout readiness confirmed. Eligible to claim live work.",
  },
  poster: {
    email: "poster@taskverified.demo",
    fullName: "TaskVerified Labs",
    location: "Remote",
    bio: "Startup team posting tightly scoped, proof-based tasks for product feedback and community operations.",
    verificationStatus: "pending" as const,
    verificationNotes: "Organization review in progress. Posting remains available for the current MVP loop.",
  },
};

async function fetchAuthShape(userId: string): Promise<Pick<AuthState, "profile" | "verification">> {
  const supabase = requireSupabase();
  const [{ data: profileRow, error: profileError }, { data: verificationRow, error: verificationError }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle<BackendProfileRow>(),
    supabase.from("verification_records").select("*").eq("user_id", userId).maybeSingle<BackendVerificationRow>(),
  ]);

  if (profileError) {
    throw profileError;
  }

  if (verificationError) {
    throw verificationError;
  }

  const profile =
    profileRow?.role && profileRow.full_name && profileRow.location && profileRow.bio
      ? ({
          userId: profileRow.user_id,
          fullName: profileRow.full_name,
          role: profileRow.role,
          location: profileRow.location,
          bio: profileRow.bio,
          setupCompletedAt: profileRow.created_at,
        } satisfies UserProfile)
      : null;

  return {
    profile,
    verification: mapVerification(verificationRow, userId),
  };
}

export async function getAuthStateFromSupabase(): Promise<AuthState> {
  const supabase = requireSupabase();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.user) {
    return { user: null, profile: null, verification: null };
  }

  const user: SessionUser = {
    id: session.user.id,
    email: session.user.email ?? session.user.user_metadata.contact_email ?? "",
    role: (session.user.user_metadata.role as UserRole | null | undefined) ?? null,
    createdAt: session.user.created_at ?? new Date().toISOString(),
  };
  const authShape = await fetchAuthShape(session.user.id);

  return {
    user: {
      ...user,
      role: authShape.profile?.role ?? user.role,
    },
    profile: authShape.profile,
    verification: authShape.verification,
  };
}

async function ensureAnonymousSession(contactEmail: string, role?: UserRole) {
  const supabase = requireSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const existingEmail = session?.user?.email ?? session?.user?.user_metadata.contact_email ?? null;

  if (session?.user && existingEmail && existingEmail !== contactEmail) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw signOutError;
    }
  }

  const {
    data: { session: refreshedSession },
  } = await supabase.auth.getSession();

  if (!refreshedSession?.user) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      throw error;
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw userError ?? new Error("No authenticated Supabase user is available.");
  }

  const metadata = {
    ...user.user_metadata,
    contact_email: contactEmail,
    role: role ?? user.user_metadata.role ?? null,
  };

  const { error: updateError } = await supabase.auth.updateUser({
    data: metadata,
  });

  if (updateError) {
    throw updateError;
  }

  return user.id;
}

async function seedDemoPosterTasks(userId: string) {
  const supabase = requireSupabase();
  const { count, error: countError } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("poster_id", userId);

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) > 0) {
    return;
  }

  const demoTasks = [
    {
      p_title: "Test mobile onboarding and attach annotated screenshots",
      p_description: "Run the onboarding flow on mobile, capture friction points, and explain exactly where trust or clarity drops.",
      p_category: "testing",
      p_proof_requirements: ["Screenshot set from start to finish", "Short summary of friction points", "One improvement recommendation"],
      p_reward_amount: 30,
      p_reward_currency: "USD",
      p_deadline_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
      p_status: "open",
    },
    {
      p_title: "Verify community onboarding instructions against the live flow",
      p_description: "Compare the written community onboarding guide to the actual product flow and note any mismatches with proof.",
      p_category: "community",
      p_proof_requirements: ["Written mismatch report", "Link to live flow or screenshots", "Checklist confirming each step reviewed"],
      p_reward_amount: 20,
      p_reward_currency: "USD",
      p_deadline_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      p_status: "open",
    },
  ] as const;

  for (const task of demoTasks) {
    const { error } = await supabase.rpc("create_task", task);
    if (error) {
      throw error;
    }
  }
}

export async function signInWithSupabaseEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return ensureAnonymousSession(normalized);
}

export async function chooseSupabaseRole(role: UserRole) {
  const supabase = requireSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw error ?? new Error("No authenticated Supabase user is available.");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      role,
    },
  });

  if (updateError) {
    throw updateError;
  }
}

export async function saveSupabaseProfile(input: { fullName: string; location: string; bio: string; role: UserRole }) {
  const supabase = requireSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw error ?? new Error("No authenticated Supabase user is available.");
  }

  const email = user.email ?? user.user_metadata.contact_email ?? "";
  const now = new Date().toISOString();

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      email,
      role: input.role,
      full_name: input.fullName.trim(),
      location: input.location.trim(),
      bio: input.bio.trim(),
      verification_status: input.role === "worker" ? "pending" : "unverified",
      updated_at: now,
    },
    {
      onConflict: "user_id",
    },
  );

  if (profileError) {
    throw profileError;
  }

  const { error: verificationError } = await supabase.from("verification_records").upsert(
    {
      user_id: user.id,
      status: input.role === "worker" ? "pending" : "unverified",
      submitted_at: input.role === "worker" ? now : null,
      notes:
        input.role === "worker"
          ? "Verification submitted. Task claiming stays blocked until review clears."
          : "Poster identity review has not started yet.",
      updated_at: now,
    },
    {
      onConflict: "user_id",
    },
  );

  if (verificationError) {
    throw verificationError;
  }
}

export async function provisionDemoSupabaseAccount(role: UserRole) {
  const demo = demoProfiles[role];
  const userId = await ensureAnonymousSession(demo.email, role);
  const supabase = requireSupabase();
  const now = new Date().toISOString();

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      email: demo.email,
      role,
      full_name: demo.fullName,
      location: demo.location,
      bio: demo.bio,
      verification_status: demo.verificationStatus,
      updated_at: now,
      wallet_connection_status: "disconnected",
    },
    { onConflict: "user_id" },
  );

  if (profileError) {
    throw profileError;
  }

  const verificationPayload: VerificationRecord & { updated_at?: string } = {
    userId,
    status: demo.verificationStatus,
    submittedAt: now,
    reviewedAt: role === "worker" ? now : undefined,
    notes: demo.verificationNotes,
    updated_at: now,
  };

  const { error: verificationError } = await supabase.from("verification_records").upsert(
    {
      user_id: verificationPayload.userId,
      status: verificationPayload.status,
      submitted_at: verificationPayload.submittedAt,
      reviewed_at: verificationPayload.reviewedAt ?? null,
      notes: verificationPayload.notes,
      updated_at: now,
    },
    { onConflict: "user_id" },
  );

  if (verificationError) {
    throw verificationError;
  }

  if (role === "poster") {
    await seedDemoPosterTasks(userId);
  }
}

export async function signOutFromSupabase() {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
