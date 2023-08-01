export enum OnRampProvider {
  COINBASE = 'coinbase',
  STRIPE = 'stripe',
  UNKNOWN = 'unknown'
}

export type PurchaseInfo = {
  desiredAmount: AmountObject
}

export enum BuyUSDCStage {
  START = 'START',
  PURCHASING = 'PURCHASING',
  CONFIRMING_PURCHASE = 'CONFIRMING_PURCHASE',
  CANCELED = 'CANCELED',
  FINISH = 'FINISH'
}

export type AmountObject = {
  amount: number
  amountString: string
  uiAmount: number
  uiAmountString: string
}
