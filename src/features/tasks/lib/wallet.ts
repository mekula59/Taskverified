export function generateSolanaWalletAddress(seed: string) {
  const compact = seed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12).padEnd(12, "X");
  return `So1${compact}WalletReady111111111111`;
}

export function generateTxSignature(seed: string) {
  return `solana-tx-placeholder-${seed}-${Date.now()}`;
}
