import { Nullable } from '../utils/typeUtils'

import { StringUSDC } from './Wallet'

export enum USDCTransactionType {
  PURCHASE = 'PURCHASE',
  PURCHASE_CONTENT = 'PURCHASE_CONTENT',
  TRANSFER = 'TRANSFER'
}

export enum USDCTransactionMethod {
  // Transfer methods
  SEND = 'SENT',
  // TODO: Is this needed? Do we write a transaction for both the sender and recipient?
  RECEIVE = 'RECEIVED',

  // Purchase Methods
  STRIPE = 'STRIPE'
}

export enum USDCTransactionMetadataType {
  PURCHASE_USDC = 'PURCHASE_USDC',
  PURCHASE_CONTENT = 'PURCHASE_CONTENT',
  TRANSER = 'TRANSFER'
}

export type InAppUSDCPurchaseMetadata = {
  discriminator: USDCTransactionMetadataType.PURCHASE_USDC
  usd: string
  usdc: StringUSDC
  purchaseTransactionId: string
}

export enum USDCContentPurchaseType {
  TRACK = 'TRACK'
}

export type USDCPurchaseContentMetadata = {
  discriminator: USDCTransactionMetadataType.PURCHASE_CONTENT
  amount: StringUSDC
  senderUserId: string
  receiverUserId: string
  purchaseType: USDCContentPurchaseType
  contentId: string
}

export type USDCTransferMetadata = {
  discriminator: USDCTransactionMetadataType.TRANSER
  amount: StringUSDC
  destination: string
}

export type USDCTransactionDetails =
  | {
      signature: string
      transactionType: USDCTransactionType.PURCHASE
      method: USDCTransactionMethod.STRIPE
      date: string
      change: StringUSDC
      balance: StringUSDC
      metadata?: Nullable<InAppUSDCPurchaseMetadata>
    }
  | {
      signature: string
      transactionType: USDCTransactionType.PURCHASE_CONTENT
      // TODO: Both send and receive valid here?
      method: USDCTransactionMethod.SEND | USDCTransactionMethod.RECEIVE
      date: string
      change: StringUSDC
      balance: StringUSDC
      metadata?: Nullable<USDCPurchaseContentMetadata>
    }
  | {
      signature: string
      transactionType: USDCTransactionType.TRANSFER
      // TODO: Both send and receive valid here?
      method: USDCTransactionMethod.SEND | USDCTransactionMethod.RECEIVE
      date: string
      change: StringUSDC
      balance: StringUSDC
      metadata: USDCTransferMetadata
    }
