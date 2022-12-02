export function* connectPhantomWallet() {
  const connectingWallet = solana.publicKey?.toString()
  const disconnect = async () => {
    await solana.disconnect()
  }
  if (connectingWallet) {
    yield* call(connectSPLWallet, connectingWallet, solana, disconnect)
  }
}
