import { AccountInfo, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'

import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'
// @ts-ignore
const libs = () => window.audiusLibs

const TOKEN_ACCOUNT_POLL_MS = 5000
const MAX_TOKEN_ACCOUNT_POLL_COUNT = 20

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
  let tokenAccountInfo: AccountInfo =
    await libs().solanaWeb3Manager.getAssociatedTokenAccountInfo(
      associatedTokenAccount.toString()
    )
  let retries = 0
  while (!tokenAccountInfo && retries < MAX_TOKEN_ACCOUNT_POLL_COUNT) {
    console.debug(
      `$AUDIO account not found. Retrying... ${retries}/${MAX_TOKEN_ACCOUNT_POLL_COUNT}`
    )
    retries++
    await new Promise((resolve, reject) => {
      setTimeout(resolve, TOKEN_ACCOUNT_POLL_MS)
    })
    tokenAccountInfo =
      await libs().solanaWeb3Manager.getAssociatedTokenAccountInfo(
        associatedTokenAccount.toString()
      )
  }
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
