import { SolanaWalletAddress } from '@audius/common'
// import { MintName } from '@audius/sdk'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  AccountInfo
} from '@solana/spl-token'
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  Keypair
} from '@solana/web3.js'

import { getLibs } from 'services/audius-libs'

type MintName = 'usdc' | 'audio'
const ROOT_ACCOUNT_SIZE = 0 // Root account takes 0 bytes, but still pays rent!
const DEFAULT_MINT = 'audio'

/**
 * Gets the solana connection from libs.
 */
export const getSolanaConnection = async () => {
  const libs = await getLibs()
  return libs.solanaWeb3Manager!.connection
}

/**
 * Checks if the given address is a solana address vs an associated token account.
 */
export const isSolWallet = async (destinationWallet: SolanaWalletAddress) => {
  try {
    const destination = new PublicKey(destinationWallet)
    return PublicKey.isOnCurve(destination.toBytes())
  } catch (err) {
    console.error(err)
    return false
  }
}

/**
 * Gets the current user's root solana account.
 */
export const getRootSolanaAccount = async () => {
  const libs = await getLibs()
  return Keypair.fromSeed(libs.Account!.hedgehog.wallet!.getPrivateKey())
}

/**
 * Checks whether the input address is a valid solana address.
 */
export const isValidSolAddress = async (address: SolanaWalletAddress) => {
  const libs = await getLibs()
  const solanaweb3 = libs.solanaWeb3Manager!.solanaWeb3
  if (!solanaweb3) {
    console.error('No solana web3 found')
    return false
  }
  try {
    // @ts-ignore - need an unused variable to check if the destinationWallet is valid
    const ignored = new solanaweb3.PublicKey(address)
    return true
  } catch (err) {
    console.debug(err)
    return false
  }
}

/**
 * Calculates the minimum amount of rent needed for a solana account to be
 * rent-exempt.
 */
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
 * Gets the token account info for a given token account.
 */
export const getTokenAccountInfo = async ({
  tokenAccount,
  mint = DEFAULT_MINT
}: {
  tokenAccount: PublicKey
  mint?: MintName
}): Promise<AccountInfo | null> => {
  const libs = await getLibs()
  return await libs.solanaWeb3Manager!.getTokenAccountInfo(
    tokenAccount.toString(),
    mint
  )
}

/**
 * Gets the recent blockhash.
 */
export const getRecentBlockhash = async () => {
  const connection = await getSolanaConnection()
  return (await connection.getLatestBlockhash()).blockhash
}

/**
 * Gets the fee for a transfer transaction.
 */
export const getTransferTransactionFee = async (
  destinationPubkey: PublicKey
) => {
  const connection = await getSolanaConnection()
  const recentBlockhash = await getRecentBlockhash()
  const tx = new Transaction({ recentBlockhash })
  tx.feePayer = destinationPubkey
  return await tx.getEstimatedFee(connection)
}

/**
 * Calculates the rent for an associated token account.
 */
export const getAssociatedTokenAccountRent = async () => {
  const connection = await getSolanaConnection()
  const rent = await Token.getMinBalanceRentForExemptAccount(connection)
  return rent
}

/**
 * Returns the associated USDC token account for the given solana account.
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

/**
 * Creates a new solana transaction.
 */
export const getNewTransaction = async (recentBlockhash: string) => {
  // const connection = await getSolanaConnection()
  const blockhash = recentBlockhash
  return new Transaction({ recentBlockhash: blockhash })
}

/**
 * Adds a userbank transfer instruction to a given transaction.
 */
export const addTransferInstructionToTransaction = async ({
  transaction,
  amount,
  mint,
  from,
  to,
  owner,
  decimals
}: {
  transaction: Transaction
  amount: number
  mint: MintName
  from: PublicKey
  to: PublicKey
  owner: PublicKey
  decimals: number
}) => {
  const libs = await getLibs()
  const instruction = Token.createTransferCheckedInstruction(
    TOKEN_PROGRAM_ID,
    from, // from
    libs.solanaWeb3Manager!.mints[mint], // mint
    to, // to
    owner, // owner
    [], // multisigners
    amount, // amount
    decimals // decimals
  )
  transaction.add(instruction)
}

/**
 * Signs a set of instructions with the supplied signer and fee payer.
 */
export const getSignatureForTransaction = async ({
  instructions,
  signer,
  feePayer,
  recentBlockhash
}: {
  instructions: TransactionInstruction[]
  signer: Keypair
  feePayer: PublicKey
  recentBlockhash: string
}) => {
  const transaction = new Transaction({ recentBlockhash })
  transaction.add(...instructions)
  transaction.feePayer = feePayer
  transaction.partialSign(signer)
  const nonNull = transaction.signatures.filter((s) => s.signature !== null)
  return nonNull
}
