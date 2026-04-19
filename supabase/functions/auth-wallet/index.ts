import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import bs58 from "https://esm.sh/bs58@6.0.0";
import nacl from "https://esm.sh/tweetnacl@1.0.3";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase environment variables are not configured for auth-wallet.");
}

const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const allowedAction = new Set(["nonce", "verify"]);

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

function serializeDebugError(error: unknown) {
  if (error instanceof Error) {
    return {
      type: error.name,
      message: error.message,
    };
  }

  if (error && typeof error === "object") {
    const maybeRecord = error as Record<string, unknown>;

    return {
      type: typeof maybeRecord.code === "string" ? "PostgrestError" : "UnknownObject",
      message: typeof maybeRecord.message === "string" ? maybeRecord.message : "Wallet authentication failed.",
      code: typeof maybeRecord.code === "string" ? maybeRecord.code : null,
      details: typeof maybeRecord.details === "string" ? maybeRecord.details : null,
      hint: typeof maybeRecord.hint === "string" ? maybeRecord.hint : null,
    };
  }

  return {
    type: typeof error,
    message: "Wallet authentication failed.",
  };
}

function toUint8Array(input: string) {
  return new TextEncoder().encode(input);
}

function normalizeWalletAddress(walletAddress: string) {
  return walletAddress.trim();
}

function syntheticWalletEmail(walletAddress: string) {
  return `wallet_${walletAddress.toLowerCase()}@wallet.taskverified.local`;
}

function randomPassword() {
  return crypto.randomUUID() + crypto.randomUUID();
}

function buildWalletMessage(walletAddress: string, nonce: string, expiresAt: string) {
  return [
    "TaskVerified wants to verify your Phantom wallet.",
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    `Expires: ${expiresAt}`,
  ].join("\n");
}

function decodeWalletAddress(walletAddress: string) {
  try {
    return bs58.decode(walletAddress);
  } catch {
    throw new Error("Wallet address is not valid base58.");
  }
}

async function findWalletUser(walletAddress: string) {
  const normalized = normalizeWalletAddress(walletAddress);
  const { data: identity, error: identityError } = await admin
    .from("wallet_auth_identities")
    .select("user_id")
    .eq("wallet_address", normalized)
    .maybeSingle<{ user_id: string }>();

  if (identityError) {
    throw identityError;
  }

  if (identity?.user_id) {
    return {
      userId: identity.user_id,
      isNewUser: false,
    };
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("user_id")
    .eq("wallet_address", normalized)
    .maybeSingle<{ user_id: string }>();

  if (profileError) {
    throw profileError;
  }

  if (profile?.user_id) {
    const { error: identityUpsertError } = await admin.from("wallet_auth_identities").upsert(
      {
        wallet_address: normalized,
        user_id: profile.user_id,
        provider: "phantom",
        last_authenticated_at: new Date().toISOString(),
      },
      { onConflict: "wallet_address" },
    );

    if (identityUpsertError) {
      throw identityUpsertError;
    }

    return {
      userId: profile.user_id,
      isNewUser: false,
    };
  }

  const email = syntheticWalletEmail(normalized);
  const password = randomPassword();
  const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      auth_method: "wallet",
      wallet_address: normalized,
      wallet_provider: "phantom",
    },
  });

  if (createError || !createdUser.user) {
    throw createError ?? new Error("Unable to create wallet auth user.");
  }

  const { error: identityInsertError } = await admin.from("wallet_auth_identities").insert({
    wallet_address: normalized,
    user_id: createdUser.user.id,
    provider: "phantom",
  });

  if (identityInsertError) {
    throw identityInsertError;
  }

  return {
    userId: createdUser.user.id,
    isNewUser: true,
  };
}

async function getWalletAuthUser(userId: string) {
  const { data, error } = await admin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    throw error ?? new Error("Wallet auth user could not be loaded.");
  }

  return data.user;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";

    if (!allowedAction.has(action)) {
      return jsonResponse({ error: "Unsupported auth-wallet action." }, { status: 400 });
    }

    if (action === "nonce") {
      const walletAddress = normalizeWalletAddress(String(body.walletAddress ?? ""));
      if (!walletAddress) {
        return jsonResponse({ error: "Wallet address is required." }, { status: 400 });
      }

      const nonce = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 10).toISOString();
      const message = buildWalletMessage(walletAddress, nonce, expiresAt);

      const { error } = await admin.from("wallet_auth_challenges").upsert(
        {
          wallet_address: walletAddress,
          nonce,
          message,
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
        },
        { onConflict: "wallet_address" },
      );

      if (error) {
        const debug = serializeDebugError(error);

        console.error("auth-wallet nonce upsert failed", {
          walletAddress,
          debug,
        });

        return jsonResponse(
          {
            error: "Wallet auth nonce upsert failed.",
            debug,
          },
          { status: 500 },
        );
      }

      return jsonResponse({
        walletAddress,
        nonce,
        message,
        expiresAt,
      });
    }

    const walletAddress = normalizeWalletAddress(String(body.walletAddress ?? ""));
    const message = String(body.message ?? "");
    const signature = String(body.signature ?? "");

    if (!walletAddress || !message || !signature) {
      return jsonResponse({ error: "Wallet address, message, and signature are required." }, { status: 400 });
    }

    const { data: challenge, error: challengeError } = await admin
      .from("wallet_auth_challenges")
      .select("nonce, message, expires_at")
      .eq("wallet_address", walletAddress)
      .maybeSingle<{ nonce: string; message: string; expires_at: string }>();

    if (challengeError) {
      throw challengeError;
    }

    if (!challenge) {
      return jsonResponse({ error: "Wallet auth challenge not found." }, { status: 400 });
    }

    if (new Date(challenge.expires_at).getTime() < Date.now()) {
      return jsonResponse({ error: "Wallet auth challenge expired. Start again." }, { status: 400 });
    }

    if (challenge.message !== message) {
      return jsonResponse({ error: "Wallet auth message did not match the stored challenge." }, { status: 400 });
    }

    const signatureBytes = decodeBase64(signature);
    const messageBytes = toUint8Array(message);
    const publicKeyBytes = decodeWalletAddress(walletAddress);

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    if (!isValid) {
      return jsonResponse({ error: "Wallet signature verification failed." }, { status: 401 });
    }

    const identity = await findWalletUser(walletAddress);
    const authUser = await getWalletAuthUser(identity.userId);
    const email = authUser.email;
    const password = randomPassword();

    if (!email) {
      throw new Error("Wallet auth user is missing an email address.");
    }

    const { error: updateUserError } = await admin.auth.admin.updateUserById(identity.userId, {
      password,
      user_metadata: {
        ...(authUser.user_metadata ?? {}),
        auth_method: "wallet",
        wallet_address: walletAddress,
        wallet_provider: "phantom",
      },
    });

    if (updateUserError) {
      throw updateUserError;
    }

    const { error: identityUpsertError } = await admin.from("wallet_auth_identities").upsert(
      {
        wallet_address: walletAddress,
        user_id: identity.userId,
        provider: "phantom",
        last_authenticated_at: new Date().toISOString(),
      },
      { onConflict: "wallet_address" },
    );

    if (identityUpsertError) {
      throw identityUpsertError;
    }

    const { error: challengeDeleteError } = await admin
      .from("wallet_auth_challenges")
      .delete()
      .eq("wallet_address", walletAddress);

    if (challengeDeleteError) {
      throw challengeDeleteError;
    }

    return jsonResponse({
      email,
      password,
      userId: identity.userId,
      isNewUser: identity.isNewUser,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Wallet authentication failed.",
      },
      { status: 500 },
    );
  }
});
