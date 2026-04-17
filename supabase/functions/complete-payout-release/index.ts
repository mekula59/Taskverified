import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error("Supabase environment variables are not configured for complete-payout-release.");
}

type PayoutRow = {
  id: string;
  task_id: string;
  worker_id: string;
  poster_id: string;
  worker_wallet_address: string | null;
  poster_wallet_address: string | null;
  transfer_amount_lamports: number;
  status: "pending" | "ready_to_release" | "released" | "failed";
};

type SolanaInstruction = {
  program?: string;
  parsed?: {
    type?: string;
    info?: {
      source?: string;
      destination?: string;
      lamports?: number;
    };
  };
};

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

async function fetchDevnetTransaction(signature: string) {
  const response = await fetch("https://api.devnet.solana.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: signature,
      method: "getTransaction",
      params: [
        signature,
        {
          encoding: "jsonParsed",
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("Solana devnet transaction lookup failed.");
  }

  const payload = await response.json();

  if (payload.error) {
    throw new Error(payload.error.message ?? "Solana devnet transaction lookup failed.");
  }

  return payload.result as
    | {
        meta?: { err?: unknown };
        transaction?: {
          message?: {
            instructions?: SolanaInstruction[];
          };
        };
      }
    | null;
}

function hasMatchingTransferInstruction(transaction: Awaited<ReturnType<typeof fetchDevnetTransaction>>, payout: PayoutRow) {
  const instructions = transaction?.transaction?.message?.instructions ?? [];

  return instructions.some((instruction) => {
    const info = instruction.parsed?.info;

    return (
      instruction.program === "system" &&
      instruction.parsed?.type === "transfer" &&
      info?.source === payout.poster_wallet_address &&
      info?.destination === payout.worker_wallet_address &&
      info?.lamports === payout.transfer_amount_lamports
    );
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return jsonResponse({ error: "Authorization is required." }, { status: 401 });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    });

    const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unable to verify the authenticated user." }, { status: 401 });
    }

    const body = await request.json();
    const payoutId = String(body.payoutId ?? "").trim();
    const txSignature = String(body.txSignature ?? "").trim();

    if (!payoutId || !txSignature) {
      return jsonResponse({ error: "Payout ID and transaction signature are required." }, { status: 400 });
    }

    const { data: payout, error: payoutError } = await admin
      .from("payouts")
      .select("id, task_id, worker_id, poster_id, worker_wallet_address, poster_wallet_address, transfer_amount_lamports, status")
      .eq("id", payoutId)
      .maybeSingle<PayoutRow>();

    if (payoutError) {
      throw payoutError;
    }

    if (!payout) {
      return jsonResponse({ error: "Payout not found." }, { status: 404 });
    }

    if (payout.poster_id !== user.id) {
      return jsonResponse({ error: "Only the task poster can finalize this payout." }, { status: 403 });
    }

    if (payout.status !== "ready_to_release") {
      return jsonResponse({ error: "Payout is not ready to release." }, { status: 400 });
    }

    if (!payout.poster_wallet_address || !payout.worker_wallet_address) {
      return jsonResponse({ error: "Both poster and worker wallets must be connected before release." }, { status: 400 });
    }

    const transaction = await fetchDevnetTransaction(txSignature);

    if (!transaction) {
      return jsonResponse({ error: "The Solana devnet transaction was not found or is not confirmed yet." }, { status: 400 });
    }

    if (transaction.meta?.err) {
      return jsonResponse({ error: "The Solana devnet transaction failed and cannot complete this payout." }, { status: 400 });
    }

    if (!hasMatchingTransferInstruction(transaction, payout)) {
      return jsonResponse(
        { error: "The Solana devnet transaction does not match the expected poster wallet, worker wallet, and transfer amount." },
        { status: 400 },
      );
    }

    const releasedAt = new Date().toISOString();

    const { error: payoutUpdateError } = await admin
      .from("payouts")
      .update({
        status: "released",
        tx_signature: txSignature,
        failure_reason: null,
        released_at: releasedAt,
      })
      .eq("id", payoutId)
      .eq("status", "ready_to_release");

    if (payoutUpdateError) {
      throw payoutUpdateError;
    }

    const { error: taskUpdateError } = await admin
      .from("tasks")
      .update({
        status: "paid",
      })
      .eq("id", payout.task_id);

    if (taskUpdateError) {
      throw taskUpdateError;
    }

    const { error: reputationError } = await admin.rpc("refresh_reputation_for_worker", {
      p_worker_id: payout.worker_id,
    });

    if (reputationError) {
      throw reputationError;
    }

    return jsonResponse({
      payoutId,
      txSignature,
      releasedAt,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unable to complete payout release.",
      },
      { status: 500 },
    );
  }
});
