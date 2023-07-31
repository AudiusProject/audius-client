import { AudiusLibs } from '@audius/sdk'
import { PublicKey } from '@solana/web3.js'
import { u64 } from '@solana/spl-token'

import { AnalyticsEvent, Name, SolanaWalletAddress } from '../../models'

import { AudiusBackend } from './AudiusBackend'

const DEFAULT_RETRY_DELAY = 1000
const DEFAULT_MAX_RETRY_COUNT = 120

type MintName = 'audio' | 'usdc'
const DEFAULT_MINT: MintName = 'audio'

type UserBankConfig = {
  ethAddress?: string
  mint?: MintName
}

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const getRootSolanaAccount = async (
  audiusBackendInstance: AudiusBackend
) => {
  const audiusLibs: AudiusLibs = await audiusBackendInstance.getAudiusLibs()
  return audiusLibs.solanaWeb3Manager!.solanaWeb3.Keypair.fromSeed(
    audiusLibs.Account!.hedgehog.wallet!.getPrivateKey()
  )
}

export const getCurrentUserWallet = async (
  audiusBackendInstance: AudiusBackend
) => {
  const audiusLibs = await audiusBackendInstance.getAudiusLibs()
  return await audiusLibs.Account!.getCurrentUser()?.wallet
}

export const getSolanaConnection = async (
  audiusBackendInstance: AudiusBackend
) => {
  return (await audiusBackendInstance.getAudiusLibs()).solanaWeb3Manager!
    .connection
}

export const getTokenAccountInfo = async (
  audiusBackendInstance: AudiusBackend,
  {
    mint = DEFAULT_MINT,
    tokenAccount
  }: {
    mint?: MintName
    tokenAccount: PublicKey
  }
) => {
  return (
    await audiusBackendInstance.getAudiusLibs()
  ).solanaWeb3Manager!.getTokenAccountInfo(tokenAccount.toString(), mint)
}

export const deriveUserBankPubkey = async (
  audiusBackendInstance: AudiusBackend,
  { ethAddress, mint = DEFAULT_MINT }: UserBankConfig = {}
) => {
  const audiusLibs: AudiusLibs = await audiusBackendInstance.getAudiusLibs()
  return await audiusLibs.solanaWeb3Manager!.deriveUserBank({
    ethAddress,
    mint
  })
}

export const deriveUserBankAddress = async (
  audiusBackendInstance: AudiusBackend,
  { ethAddress, mint = DEFAULT_MINT }: UserBankConfig = {}
) => {
  const pubkey = await deriveUserBankPubkey(audiusBackendInstance, {
    ethAddress,
    mint
  })
  return pubkey.toString() as SolanaWalletAddress
}

type CreateUserBankIfNeededConfig = UserBankConfig & {
  recordAnalytics: (event: AnalyticsEvent, callback?: () => void) => void
  feePayerOverride: string
}

/**
 * Attempts to create a userbank.
 * Returns the userbank pubkey if it created or already existed; otherwise returns null if error.
 */
export const createUserBankIfNeeded = async (
  audiusBackendInstance: AudiusBackend,
  {
    recordAnalytics,
    feePayerOverride,
    mint = DEFAULT_MINT,
    ethAddress
  }: CreateUserBankIfNeededConfig
) => {
  const audiusLibs: AudiusLibs = await audiusBackendInstance.getAudiusLibs()

  const recipientEthAddress =
    ethAddress ?? audiusLibs.Account!.getCurrentUser()?.wallet

  if (!recipientEthAddress) {
    console.error(
      "createUserBankIfNeeded: Unexpectedly couldn't get recipient eth address"
    )
    return null
  }

  try {
    const res = await audiusLibs.solanaWeb3Manager!.createUserBankIfNeeded({
      feePayerOverride,
      ethAddress: recipientEthAddress,
      mint
    })

    // If it already existed, return early
    if ('didExist' in res && res.didExist) {
      console.log('Userbank already exists')
      return res.userbank.toString() as SolanaWalletAddress
    }

    // Otherwise we must have tried to create one
    console.info(`Userbank doesn't exist, attempted to create...`)

    recordAnalytics({
      eventName: Name.CREATE_USER_BANK_REQUEST,
      properties: { mint, recipientEthAddress }
    })

    // Handle error case
    if ('error' in res) {
      console.error(
        `Failed to create userbank, with err: ${res.error}, ${res.errorCode}`
      )
      recordAnalytics({
        eventName: Name.CREATE_USER_BANK_FAILURE,
        properties: {
          mint,
          recipientEthAddress,
          errorCode: res.errorCode,
          error: (res.error as any).toString()
        }
      })
      return null
    }

    // Handle success case
    console.log(`Successfully created userbank!`)
    recordAnalytics({
      eventName: Name.CREATE_USER_BANK_SUCCESS,
      properties: { mint, recipientEthAddress }
    })
    return res.userbank.toString() as SolanaWalletAddress
  } catch (err) {
    recordAnalytics({
      eventName: Name.CREATE_USER_BANK_FAILURE,
      properties: {
        mint,
        recipientEthAddress,
        errorMessage: (err as any).toString()
      }
    })
    console.error(`Failed to create userbank, with err: ${err}`)
    return null
  }
}

export const pollForBalanceChange = async (
  audiusBackendInstance: AudiusBackend,
  {
    tokenAccount,
    initialBalance,
    mint = DEFAULT_MINT,
    retryDelayMs = DEFAULT_RETRY_DELAY,
    maxRetryCount = DEFAULT_MAX_RETRY_COUNT
  }: {
    tokenAccount: PublicKey
    initialBalance?: u64
    mint?: MintName
    retryDelayMs?: number
    maxRetryCount?: number
  }
) => {
  let debugTokenName = mint.toUpperCase()
  let retries = 0
  let tokenAccountInfo = await getTokenAccountInfo(audiusBackendInstance, {
    mint,
    tokenAccount
  })
  while (
    (!tokenAccountInfo ||
      initialBalance === undefined ||
      tokenAccountInfo.amount.eq(initialBalance)) &&
    retries++ < maxRetryCount
  ) {
    if (!tokenAccountInfo) {
      console.debug(
        `${debugTokenName} account not found. Retrying... ${retries}/${maxRetryCount}`
      )
    } else if (initialBalance === undefined) {
      initialBalance = tokenAccountInfo.amount
    } else if (tokenAccountInfo.amount.eq(initialBalance)) {
      console.debug(
        `Polling ${debugTokenName} balance (${initialBalance} === ${tokenAccountInfo.amount}) [${retries}/${maxRetryCount}]`
      )
    }
    await delay(retryDelayMs)
    tokenAccountInfo = await getTokenAccountInfo(audiusBackendInstance, {
      mint,
      tokenAccount
    })
  }
  if (
    tokenAccountInfo &&
    initialBalance &&
    !tokenAccountInfo.amount.eq(initialBalance)
  ) {
    console.debug(
      `${debugTokenName} balance changed by ${tokenAccountInfo.amount.sub(
        initialBalance
      )} (${initialBalance} => ${tokenAccountInfo.amount})`
    )
    return tokenAccountInfo.amount
  }
  throw new Error(`${debugTokenName} balance polling exceeded maximum retries`)
}
