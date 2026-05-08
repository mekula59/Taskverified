import type { AuthState, SessionUser, UserProfile, UserRole, WalletAuthChallenge } from "@/features/shared/types/domain";
import { mapVerification, type BackendProfileRow, type BackendVerificationRow } from "@/lib/supabase/mappers";
import { requireSupabase } from "@/lib/supabase/client";

export function formatAuthError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();

  if (
    normalized.includes("email rate limit exceeded") ||
    normalized.includes("rate limit") ||
    normalized.includes("too many requests") ||
    normalized.includes("too many attempts")
  ) {
    return "Too many email requests. Please wait a few minutes before requesting another link.";
  }

  if (normalized.includes("for security purposes")) {
    return "Email sign-in is temporarily paused for security throttling. Wait a minute, then try again or continue with Phantom.";
  }

  if (
    normalized.includes("signups not allowed") ||
    normalized.includes("signup disabled") ||
    normalized.includes("signups are disabled") ||
    (normalized.includes("signup") && normalized.includes("otp"))
  ) {
    return "Email access is not available for this address yet. Use Phantom or try the email linked to your TaskVerified account.";
  }

  if (
    normalized.includes("invalid email") ||
    normalized.includes("email address is invalid") ||
    normalized.includes("unable to validate email")
  ) {
    return "Enter a valid email address.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "We couldn't verify that account. Open your latest TaskVerified magic link or request a new one.";
  }

  if (normalized.includes("user not found")) {
    return "No TaskVerified account was found for that email yet. Use sign up or continue with Phantom.";
  }

  if (normalized.includes("network")) {
    return "TaskVerified couldn't reach Supabase. Check your connection and try again.";
  }

  if (normalized.includes("wallet auth challenge expired")) {
    return "That Phantom sign-in request expired. Start the wallet flow again.";
  }

  if (normalized.includes("wallet signature verification failed")) {
    return "Phantom signature verification failed. Approve the exact TaskVerified message and try again.";
  }

  if (normalized.includes("phantom connected, but message signing is unavailable")) {
    return "Phantom connected, but signing is not available yet. Unlock the wallet and try again.";
  }

  return fallback && fallback !== message
    ? fallback
    : "Email access could not be completed right now. Try Phantom or try again shortly.";
}

function getAuthRedirectUrl() {
  if (typeof window !== "undefined") {
    return new URL("/auth/callback", window.location.origin).toString();
  }

  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();

  if (configuredSiteUrl) {
    return new URL("/auth/callback", configuredSiteUrl).toString();
  }

  return "http://localhost:5173/auth/callback";
}

function getCallbackUrl(url?: string) {
  if (url) {
    return new URL(url);
  }

  if (typeof window !== "undefined") {
    return new URL(window.location.href);
  }

  return new URL(getAuthRedirectUrl());
}

function encodeUtf8(input: string) {
  return new TextEncoder().encode(input);
}

function encodeBase64(bytes: Uint8Array) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

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

export async function exchangeEmailAuthCode(code: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    throw error;
  }
}

export async function completeEmailAuthCallback(url?: string) {
  const supabase = requireSupabase();
  const callbackUrl = getCallbackUrl(url);
  const code = callbackUrl.searchParams.get("code");
  const tokenHash = callbackUrl.searchParams.get("token_hash");
  const rawType = callbackUrl.searchParams.get("type");
  const hashParams = new URLSearchParams(callbackUrl.hash.replace(/^#/, ""));
  const accessToken = callbackUrl.searchParams.get("access_token") ?? hashParams.get("access_token");
  const refreshToken = callbackUrl.searchParams.get("refresh_token") ?? hashParams.get("refresh_token");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    return;
  }

  if (code) {
    await exchangeEmailAuthCode(code);
    return;
  }

  if (tokenHash && rawType) {
    const type = rawType === "signup" ? "email" : rawType;

    if (type === "email" || type === "recovery" || type === "invite" || type === "email_change") {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (error) {
        throw error;
      }

      return;
    }
  }

  if (accessToken) {
    if (refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        throw error;
      }
    }

    return;
  }

  throw new Error("The email sign-in link is missing the Supabase callback parameters needed to finish authentication.");
}

async function requestEmailAuth(email: string, shouldCreateUser: boolean) {
  const supabase = requireSupabase();
  const normalized = email.trim().toLowerCase();

  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      shouldCreateUser,
      data: {
        contact_email: normalized,
      },
    },
  });

  if (error) {
    throw error;
  }
}

export async function signInWithSupabaseEmail(email: string) {
  return requestEmailAuth(email, false);
}

export async function signUpWithSupabaseEmail(email: string) {
  return requestEmailAuth(email, true);
}

export async function beginWalletAuthChallenge(walletAddress: string): Promise<WalletAuthChallenge> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.functions.invoke<WalletAuthChallenge>("auth-wallet", {
    body: {
      action: "nonce",
      walletAddress,
    },
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Unable to start wallet authentication.");
  }

  return data;
}

export async function signInWithSupabaseWallet(input: {
  walletAddress: string;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}) {
  const supabase = requireSupabase();
  const challenge = await beginWalletAuthChallenge(input.walletAddress);
  const message = challenge.message;
  const signatureBytes = await input.signMessage(encodeUtf8(message));
  const signature = encodeBase64(signatureBytes);

  const { data, error } = await supabase.functions.invoke<{
    email: string;
    password: string;
  }>("auth-wallet", {
    body: {
      action: "verify",
      walletAddress: input.walletAddress,
      message,
      signature,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.email || !data.password) {
    throw new Error("Wallet verification completed, but a sign-in session could not be created.");
  }

  const signInResult = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (signInResult.error) {
    throw signInResult.error;
  }
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
  const walletAddress = (user.user_metadata.wallet_address as string | undefined) ?? null;
  const walletProvider = (user.user_metadata.wallet_provider as string | undefined) ?? null;
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
      wallet_address: walletAddress,
      wallet_provider: walletProvider,
      wallet_connection_status: walletAddress ? "connected" : "disconnected",
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

export async function signOutFromSupabase() {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
