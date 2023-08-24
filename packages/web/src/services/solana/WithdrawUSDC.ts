import { SolanaWalletAddress } from '@audius/common'
import { SwapMode } from '@jup-ag/core'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
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

  const libs = await getLibs()
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
  return await libs.solanaWeb3Manager!.transactionHandler.handleTransaction({
    instructions,
    skipPreflight: true,
    feePayerOverride: feePayerPubkey
  })
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
  const libs = await getLibs()

  // TODO: factor in existing sol balance
  // TODO: might have to pay rent for root sol account, see BuyAudio.ts
  const rent = await getAssociatedTokenAccountRent()
  const fee = await getTransferTransactionFee(destinationPubkey)
  const desiredSolAmount = (rent + fee) / LAMPORTS_PER_SOL
  const solanaRootAccount = await getRootSolanaAccount()
  const usdcUserBank = await libs.solanaWeb3Manager!.deriveUserBank({
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
  const libs = await getLibs()
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
        libs.solanaWeb3Manager!.mints.usdc,
        destinationPubkey
      )
    const destinationAccountInfo =
      await libs.solanaWeb3Manager!.getTokenAccountInfo(
        destinationAssociatedTokenAccount.toString(),
        'usdc'
      )
    // Destination associated token account does not exist - create and fund it
    if (destinationAccountInfo === null) {
      await createAndFundDestinationAssociatedTokenAccount(
        destinationPubkey,
        feePayerPubkey
      )
    }
  }
  // TODO: handle case where destination is a USDC associated token account
}
