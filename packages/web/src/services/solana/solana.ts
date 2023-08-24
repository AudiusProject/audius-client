import { SolanaWalletAddress } from '@audius/common'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import { PublicKey, Transaction, Keypair } from '@solana/web3.js'

import { getLibs } from 'services/audius-libs'

const ROOT_ACCOUNT_SIZE = 0 // Root account takes 0 bytes, but still pays rent!

export const getSolanaConnection = async () => {
  const libs = await getLibs()
  return libs.solanaWeb3Manager!.connection
}

/**
 * Checks if the given address is a solana address vs an associated token account.
 * @param destinationWallet Address to check.
 * @returns True if the address is a solana address, false otherwise.
 */
export const isSolWallet = async (destinationWallet: SolanaWalletAddress) => {
  try {
    const destination = new PublicKey(destinationWallet)
    return PublicKey.isOnCurve(destination.toBytes())
  } catch (err) {
    console.log(err)
    return false
  }
}

export const getRootSolanaAccount = async () => {
  const libs = await getLibs()
  return Keypair.fromSeed(libs.Account!.hedgehog.wallet!.getPrivateKey())
}

export const getRootAccountRentExemptionMinimum = async () => {
  const connection = await getSolanaConnection()
  return (
    (await connection.getMinimumBalanceForRentExemption(
      ROOT_ACCOUNT_SIZE,
      'processed'
    )) + 15000 // Allows for 3 transaction fees
  )
}

/**
 * Gets the fee for a transfer transaction.
 * @param destinationPubkey Any public key, used for creating the temp transaction to
 * estimate the fee.
 * @returns The fee for a transfer transaction.
 */
export const getTransferTransactionFee = async (
  destinationPubkey: PublicKey
) => {
  const connection = await getSolanaConnection()
  const recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  const tx = new Transaction({ recentBlockhash })
  tx.feePayer = destinationPubkey
  return await tx.getEstimatedFee(connection)
}

/**
 * Calculates the rent for an associated token account.
 * @returns The rent for an associated token account.
 */
export const getAssociatedTokenAccountRent = async () => {
  const connection = await getSolanaConnection()
  const rent = await Token.getMinBalanceRentForExemptAccount(connection)
  return rent
}

/**
 * Returns the associated USDC token account for the given solana account.
 * @param solanaRootAccountPubkey Solana account to get the associated USDC token account for.
 * @returns The associated USDC token account.
 */
export const getUSDCAssociatedTokenAccount = async (
  solanaRootAccountPubkey: PublicKey
) => {
  const libs = await getLibs()
  return await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    libs.solanaWeb3Manager!.mints.usdc,
    solanaRootAccountPubkey
  )
}
