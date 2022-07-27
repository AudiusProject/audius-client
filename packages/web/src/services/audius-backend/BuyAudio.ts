import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'

import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'
// @ts-ignore
const libs = () => window.audiusLibs

export const getRootSolanaAccount = async () => {
  await waitForLibsInit()
  return libs().solanaWeb3Manager.solanaWeb3.Keypair.fromSeed(
    libs().Account.hedgehog.wallet.getPrivateKey()
  )
}

export const getSolanaConnection = async () => {
  await waitForLibsInit()
  return libs().solanaWeb3Manager.connection
}

export const sendTransactionLocal = async () => {
  await waitForLibsInit()
  const rootAccount = libs().solanaWeb3Manager.solanaWeb3.Keypair.fromSeed(
    libs().Account.hedgehog.wallet.getPrivateKey()
  )
  const connection = libs().solanaWeb3Manager.connection
}

export const createTransferToUserBankTransaction = async ({
  userBank,
  fromAccount
}: {
  userBank: string
  fromAccount: Keypair
}) => {
  await waitForLibsInit()
  const mintPublicKey = new PublicKey(libs().solanaWeb3Config.mintAddress)
  const associatedTokenAccount =
    await libs().solanaWeb3Manager.findAssociatedTokenAddress(
      fromAccount.publicKey.toString()
    )
  const tokenAccountInfo =
    await libs().solanaWeb3Manager.getAssociatedTokenAccountInfo(
      associatedTokenAccount.toString()
    )
  if (!tokenAccountInfo) {
    throw new Error('No $AUDIO account in root wallet')
  }
  const instruction = Token.createTransferCheckedInstruction(
    TOKEN_PROGRAM_ID,
    associatedTokenAccount,
    mintPublicKey,
    new PublicKey(userBank),
    fromAccount.publicKey,
    [],
    tokenAccountInfo.amount,
    8
  )
  const tx = new Transaction()
  tx.add(instruction)
  return { tx, amount: tokenAccountInfo.amount }
}
