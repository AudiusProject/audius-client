import { full } from '@audius/sdk'

import { createApi } from 'audius-query'
import { ID } from 'models/Identifiers'
import {
  USDCContentPurchaseType,
  USDCPurchaseDetails
} from 'models/USDCTransactions'
import { StringUSDC } from 'models/Wallet'
import { encodeHashId } from 'utils/hashIds'
import { Nullable } from 'utils/typeUtils'

type GetTransactionsArgs = {
  userId: Nullable<ID>
  offset: number
  limit: number
  sortMethod?: full.GetPurchasesSortMethodEnum
  sortDirection?: full.GetPurchasesSortDirectionEnum
}

const parsePurchase = (purchase: full.Purchase): USDCPurchaseDetails => {
  const { contentId, contentType, amount, buyerUserId, sellerUserId, ...rest } =
    purchase
  return {
    ...rest,
    contentType: contentType as USDCContentPurchaseType,
    contentId: Number.parseInt(contentId),
    amount: amount as StringUSDC,
    buyerUserId: Number.parseInt(buyerUserId),
    sellerUserId: Number.parseInt(sellerUserId)
  }
}

const transactionsApi = createApi({
  reducerPath: 'transactionsApi',
  endpoints: {
    getPurchases: {
      fetch: async (
        { offset, limit, userId }: GetTransactionsArgs,
        { audiusSdk, audiusBackend }
      ) => {
        const { data: encodedDataMessage, signature: encodedDataSignature } =
          await audiusBackend.signDiscoveryNodeRequest()
        const sdk = await audiusSdk()
        const { data: purchases = [] } = await sdk.full.users.getPurchases({
          limit,
          offset,
          id: encodeHashId(userId!),
          userId: encodeHashId(userId!),
          encodedDataMessage,
          encodedDataSignature
        })
        return purchases.map(parsePurchase)
      },
      options: {}
    }
  }
})

export const { useGetPurchases } = transactionsApi.hooks
export const transactionsApiReducer = transactionsApi.reducer
