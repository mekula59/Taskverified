import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, type Connection } from "@solana/web3.js";

import type { PayoutReleasePreparation } from "@/features/shared/types/domain";

function toPublicKey(address: string, label: string) {
  try {
    return new PublicKey(address);
  } catch {
    throw new Error(`${label} is not a valid Solana address.`);
  }
}

export function formatLamportsAsSol(lamports?: number) {
  if (!lamports || lamports <= 0) {
    return "0 SOL";
  }

  return `${(lamports / LAMPORTS_PER_SOL).toFixed(4)} SOL`;
}

export async function executeDevnetPayoutTransfer(input: {
  connection: Connection;
  walletPublicKey: PublicKey;
  sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>;
  preparation: PayoutReleasePreparation;
}) {
  const { connection, walletPublicKey, sendTransaction, preparation } = input;
  const fromPublicKey = walletPublicKey;
  const posterWalletAddress = fromPublicKey.toBase58();

  if (posterWalletAddress !== preparation.posterWalletAddress) {
    throw new Error("The connected poster wallet does not match the payout release wallet.");
  }

  const toPublicKeyAddress = toPublicKey(preparation.workerWalletAddress, "Worker wallet");
  const latestBlockhash = await connection.getLatestBlockhash("confirmed");

  const transaction = new Transaction({
    feePayer: fromPublicKey,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  }).add(
    SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: toPublicKeyAddress,
      lamports: preparation.transferAmountLamports,
    }),
  );

  const signature = await sendTransaction(transaction, connection);
  const confirmation = await connection.confirmTransaction(
    {
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    "confirmed",
  );

  if (confirmation.value.err) {
    throw new Error(`Solana devnet transaction failed: ${JSON.stringify(confirmation.value.err)}`);
  }

  return signature;
}
