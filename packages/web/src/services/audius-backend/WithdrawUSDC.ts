import { SolanaWalletAddress } from '@audius/common'
import { SwapMode } from '@jup-ag/core'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js'

import { JupiterSingleton } from 'services/audius-backend/Jupiter'

import { getRootSolanaAccount, getSolanaConnection } from './BuyAudio'

// @ts-ignore
const libs = (): AudiusLibs => window.audiusLibs

// TODO: Grab from remote config
// Allowable slippage amount for USDC jupiter swaps in %.
const USDC_SLIPPAGE = 3

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

/**
 * Gets the fee for a transfer transaction.
 * @param destinationPubkey Any public key, used for creating the temp transaction to
 * estimate the fee.
 * @returns The fee for a transfer transaction.
 */
const getTransferTransactionFee = async (destinationPubkey: PublicKey) => {
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
const getAssociatedTokenAccountRent = async () => {
  const connection = await getSolanaConnection()
  const rent = await Token.getMinBalanceRentForExemptAccount(connection)
  return rent
}

/**
 * Swaps USDC for SOL, taking USDC from the user's USDC user bank and
 * depositing SOL into the user's root solana account.
 * @param amount Amount of SOL to swap for.
 * @param solanaRootAccountPubkey Solana account to deposit SOL into.
 * @param usdcUserBank USDC user bank where USDC will be taken from.
 * @param solanaUSDCAssociatedTokenAccount Associated USDC token account
 * (associated with solanaRootAccount param) to store USDC that will be swapped.
 * @param feePayerPubkey Address that pays fees for the swap.
 */
const swapUSDCForSol = async (
  amount: number,
  solanaRootAccountPubkey: PublicKey,
  usdcUserBank: PublicKey,
  solanaUSDCAssociatedTokenAccount: PublicKey,
  feePayerPubkey: PublicKey
) => {
  const connection = await getSolanaConnection()

  // TODO: double check slippage
  const quoteRoute = await JupiterSingleton.getQuote({
    inputTokenSymbol: 'USDC',
    outputTokenSymbol: 'SOL',
    inputAmount: amount,
    slippage: USDC_SLIPPAGE,
    swapMode: SwapMode.ExactOut,
    onlyDirectRoutes: true
  })
  const usdcNeededAmount = quoteRoute.inputAmount

  const swapRoute = await JupiterSingleton.getQuote({
    inputTokenSymbol: 'USDC',
    outputTokenSymbol: 'SOL',
    inputAmount: usdcNeededAmount.uiAmount,
    slippage: USDC_SLIPPAGE,
    onlyDirectRoutes: true
  })
  const exchangeInfo = await JupiterSingleton.exchange({
    routeInfo: swapRoute.route,
    userPublicKey: solanaRootAccountPubkey,
    feeAccount: feePayerPubkey
  })
  const swapInstructions =
    exchangeInfo.transactions.swapTransaction.instructions

  const transferInstructions =
    await libs().solanaWeb3Manager!.createTransferInstructionsFromCurrentUser({
      amount: usdcNeededAmount.uiAmount,
      feePayerKey: feePayerPubkey,
      senderSolanaAddress: usdcUserBank,
      recipientSolanaAddress: solanaUSDCAssociatedTokenAccount,
      instructionIndex: 1,
      claimableTokenPDA: libs().solanaWeb3Manager!.claimableTokenPDAs.usdc,
      solanaTokenProgramKey: TOKEN_PROGRAM_ID,
      claimableTokenProgramKey:
        libs().solanaWeb3Manager!.claimableTokenProgramKey,
      connection,
      mint: 'usdc'
    })

  const createAssociatedTokenAccountInstruction =
    Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID, // associatedProgramId
      TOKEN_PROGRAM_ID, // programId
      libs().solanaWeb3Manager!.mints.usdc, // mint
      solanaUSDCAssociatedTokenAccount, // associatedAccount
      solanaRootAccountPubkey, // owner
      feePayerPubkey // payer
    )
  const closeAssociatedTokenAccountInstruction =
    Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID, //    programId
      solanaUSDCAssociatedTokenAccount, //  account to close
      feePayerPubkey, // fee destination
      solanaRootAccountPubkey, //  owner
      [] //  multiSigners
    )

  const instructions = [
    createAssociatedTokenAccountInstruction,
    ...transferInstructions,
    ...swapInstructions,
    closeAssociatedTokenAccountInstruction
  ]
  return await libs().solanaWeb3Manager!.transactionHandler.handleTransaction({
    instructions,
    skipPreflight: true,
    feePayerOverride: feePayerPubkey
  })
}

/**
 * Returns the associated USDC token account for the given solana account.
 * @param solanaRootAccountPubkey Solana account to get the associated USDC token account for.
 * @returns The associated USDC token account.
 */
const getUSDCAssociatedTokenAccount = async (
  solanaRootAccountPubkey: PublicKey
) => {
  return await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    libs().solanaWeb3Manager!.mints.usdc,
    solanaRootAccountPubkey
  )
}

/**
 * Creates and funds an associated token account for the destination address.
 * @param destinationPubkey Destination solana address
 * @param feePayerPubkey Fee payer
 */
const createAndFundDestinationAssociatedTokenAccount = async (
  destinationPubkey: PublicKey,
  feePayerPubkey: PublicKey
) => {
  // TODO: factor in existing sol balance
  // TODO: might have to pay rent for root sol account, see BuyAudio.ts
  const rent = await getAssociatedTokenAccountRent()
  const fee = await getTransferTransactionFee(destinationPubkey)
  const desiredSolAmount = (rent + fee) / LAMPORTS_PER_SOL

  const solanaRootAccount = await getRootSolanaAccount()
  const usdcUserBank = await libs().solanaWeb3Manager!.deriveUserBank({
    mint: 'usdc'
  })
  const solanaUSDCAssociatedTokenAccount = await getUSDCAssociatedTokenAccount(
    solanaRootAccount.publicKey
  )
  swapUSDCForSol(
    desiredSolAmount,
    solanaRootAccount.publicKey,
    usdcUserBank,
    solanaUSDCAssociatedTokenAccount,
    feePayerPubkey
  )
}

/**
 * Creates an associated token account for the destination address if it does not exist.
 * @param destinationAddress Address to create an associated token account for.
 * Can be either a solana address or a USDC associated token account address.
 * @param feePayer Address to pay fees for creating the associated token account.
 */
export const getOrCreateDestinationAssociatedTokenAccount = async ({
  destinationAddress,
  feePayer
}: {
  destinationAddress: string
  feePayer: string
}) => {
  const destinationPubkey = new PublicKey(destinationAddress)
  const feePayerPubkey = new PublicKey(feePayer)

  const isDestinationSolAddress = await isSolWallet(
    destinationAddress as SolanaWalletAddress
  )

  // Destination is a sol address - check for associated token account
  if (isDestinationSolAddress) {
    const destinationAssociatedTokenAccount =
      await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        libs().solanaWeb3Manager.mints.usdc,
        destinationPubkey
      )
    const destinationAccountInfo =
      await libs().solanaWeb3Manager!.getTokenAccountInfo({
        mint: 'usdc',
        tokenAccount: destinationAssociatedTokenAccount
      })
    // Destination associated token account does not exist - create and fund it
    if (destinationAccountInfo === null) {
      await createAndFundDestinationAssociatedTokenAccount(
        destinationPubkey,
        feePayerPubkey
      )
    }
  }
}
