import { SolanaWalletAddress } from '@audius/common'
import { SwapMode } from '@jup-ag/core'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js'
import BN from 'bn.js'

import { JupiterSingleton } from 'services/audius-backend/Jupiter'
import { getLibs } from 'services/audius-libs'
import {
  getRootSolanaAccount,
  getAssociatedTokenAccountRent,
  getTransferTransactionFee,
  getUSDCAssociatedTokenAccount,
  isSolWallet
} from 'services/solana/solana'

// TODO: Grab from remote config
// Allowable slippage amount for USDC jupiter swaps in %.
const USDC_SLIPPAGE = 3

const getWithdrawUSDCFees = async (account: PublicKey) => {
  // TODO: factor in existing sol balance
  // TODO: might have to pay rent for root sol account, see BuyAudio.ts
  const rent = await getAssociatedTokenAccountRent()
  const fee = await getTransferTransactionFee(account)
  return (rent + fee) / LAMPORTS_PER_SOL
}

/**
 * Creates instructions to swap USDC from a user bank into
 * SOL, which is deposited into the user's root solana account.
 * @param {string} destinationAddress Address to create an associated token account for.
 * Can be either a solana address or a USDC associated token account address.
 * @param {string} feePayer Fee payer address
 * @returns {Promise<TransactionInstruction[]>} Instructions to swap USDC for SOL.
 */
export const getSwapUSDCUserBankInstructions = async (
  destinationAddress: string,
  feePayer: string
): Promise<TransactionInstruction[]> => {
  const libs = await getLibs()
  const destinationPubkey = new PublicKey(destinationAddress)
  const feePayerPubkey = new PublicKey(feePayer)

  const isDestinationSolAddress = await isSolWallet(
    destinationAddress as SolanaWalletAddress
  )

  if (!isDestinationSolAddress) {
    return []
  }

  // Destination is a sol address - check for associated token account
  const destinationAssociatedTokenAccount =
    await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      libs.solanaWeb3Manager!.mints.usdc,
      destinationPubkey
    )
  const destinationAccountInfo =
    await libs.solanaWeb3Manager!.getTokenAccountInfo(
      destinationAssociatedTokenAccount.toString(),
      'usdc'
    )
  if (destinationAccountInfo !== null) {
    return []
  }

  // Destination associated token account does not exist - create and fund it
  const feeAmount = await getWithdrawUSDCFees(destinationPubkey)
  const solanaRootAccount = await getRootSolanaAccount()
  const usdcUserBank = await libs.solanaWeb3Manager!.deriveUserBank({
    mint: 'usdc'
  })
  const solanaUSDCAssociatedTokenAccount = await getUSDCAssociatedTokenAccount(
    solanaRootAccount.publicKey
  )
  const quoteRoute = await JupiterSingleton.getQuote({
    inputTokenSymbol: 'USDC',
    outputTokenSymbol: 'SOL',
    inputAmount: feeAmount,
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
    userPublicKey: solanaRootAccount.publicKey,
    feeAccount: feePayerPubkey
  })
  const swapInstructions = [
    ...(exchangeInfo.transactions.setupTransaction?.instructions ?? []),
    ...exchangeInfo.transactions.swapTransaction.instructions,
    ...(exchangeInfo.transactions.cleanupTransaction?.instructions ?? [])
  ]

  const transferInstructions =
    await libs.solanaWeb3Manager!.createTransferInstructionsFromCurrentUser({
      amount: new BN(usdcNeededAmount.uiAmount),
      feePayerKey: feePayerPubkey,
      senderSolanaAddress: usdcUserBank,
      recipientSolanaAddress: solanaUSDCAssociatedTokenAccount.toString(),
      instructionIndex: 1,
      mint: 'usdc'
    })

  const createAssociatedTokenAccountInstruction =
    Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID, // associatedProgramId
      TOKEN_PROGRAM_ID, // programId
      libs.solanaWeb3Manager!.mints.usdc, // mint
      solanaUSDCAssociatedTokenAccount, // associatedAccount
      solanaRootAccount.publicKey, // owner
      feePayerPubkey // payer
    )
  const closeAssociatedTokenAccountInstruction =
    Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID, //    programId
      solanaUSDCAssociatedTokenAccount, //  account to close
      feePayerPubkey, // fee destination
      solanaRootAccount.publicKey, //  owner
      [] //  multiSigners
    )

  return [
    createAssociatedTokenAccountInstruction,
    ...transferInstructions,
    ...swapInstructions,
    closeAssociatedTokenAccountInstruction
  ]
}
