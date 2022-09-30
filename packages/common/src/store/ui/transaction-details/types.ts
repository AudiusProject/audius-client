import { StringAudio, Status } from '../../../models'

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  TIP = 'TIP',
  CHALLENGE_REWARD = 'CHALLENGE_REWARD',
  TRENDING_REWARD = 'TRENDING_REWARD',
  TRANSFER = 'TRANSFER'
}

export enum TransactionMethod {
  // Transfer methods
  SEND = 'SENT',
  RECEIVE = 'RECEIVED',

  // Purchase Methods
  COINBASE = 'COINBASE',
  STRIPE = 'STRIPE'
}

export enum TransactionMetadataType {
  PURCHASE_SOL_AUDIO_SWAP = 'PURCHASE_SOL_AUDIO_SWAP'
}

export type InAppAudioPurchaseMetadata = {
  discriminator: TransactionMetadataType.PURCHASE_SOL_AUDIO_SWAP
  usd: string
  sol: string
  audio: StringAudio
  purchaseTransactionId: string
  setupTransactionId?: string
  swapTransactionId: string
  cleanupTransactionId?: string
}

export type TransactionDetails =
  | {
      signature: string
      transactionType: TransactionType.PURCHASE
      method:
        | TransactionMethod.COINBASE
        | TransactionMethod.STRIPE
        | TransactionMethod.RECEIVE
      date: string
      change: StringAudio
      balance: StringAudio
      metadata: InAppAudioPurchaseMetadata
    }
  | {
      signature: string
      transactionType: TransactionType.TIP | TransactionType.TRANSFER
      method: TransactionMethod.SEND | TransactionMethod.RECEIVE
      date: string
      change: StringAudio
      balance: StringAudio
      metadata?: {}
    }
  | {
      signature: string
      transactionType:
        | TransactionType.CHALLENGE_REWARD
        | TransactionType.TRENDING_REWARD
      method: TransactionMethod.RECEIVE
      date: string
      change: StringAudio
      balance: StringAudio
      metadata: InAppAudioPurchaseMetadata | undefined
    }

export type TransactionDetailsState =
  | { status: Status.IDLE }
  | { status: Status.LOADING; transactionId: string }
  | {
      status: Status.SUCCESS
      transactionDetails: TransactionDetails
    }
  | { status: Status.ERROR }
