import { full } from '@audius/sdk'

import { createApi } from 'audius-query'
import { ID } from 'models'
import {
  USDCContentPurchaseType,
  USDCPurchaseDetails
} from 'models/USDCTransactions'
import { StringUSDC } from 'models/Wallet'
import { encodeHashId } from 'utils/hashIds'
import { Nullable } from 'utils/typeUtils'

import { trackApiFetch } from './track'

type GetPurchaseListArgs = {
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

const purchasesApi = createApi({
  reducerPath: 'purchasesApi',
  endpoints: {
    getPurchases: {
      fetch: async (
        {
          offset,
          limit,
          userId,
          sortDirection,
          sortMethod
        }: GetPurchaseListArgs,
        context
      ) => {
        const { data: encodedDataMessage, signature: encodedDataSignature } =
          await context.audiusBackend.signDiscoveryNodeRequest()
        const sdk = await context.audiusSdk()
        const { data = [] } = await sdk.full.users.getPurchases({
          limit,
          offset,
          sortDirection,
          sortMethod,
          id: encodeHashId(userId!),
          userId: encodeHashId(userId!),
          encodedDataMessage,
          encodedDataSignature
        })
        const purchases = data.map(parsePurchase)

        // Pre-fetch track metadata
        const trackIdsToFetch = purchases
          .filter(
            ({ contentType }) => contentType === USDCContentPurchaseType.TRACK
          )
          .map(({ contentId }) => contentId)
        await trackApiFetch.getTracksByIds(
          { ids: trackIdsToFetch, currentUserId: userId },
          context
        )
        return purchases
      },
      options: {}
    },
    getPurchasesCount: {
      fetch: async (
        { userId }: Pick<GetPurchaseListArgs, 'userId'>,
        { audiusSdk, audiusBackend }
      ) => {
        const { data: encodedDataMessage, signature: encodedDataSignature } =
          await audiusBackend.signDiscoveryNodeRequest()
        const sdk = await audiusSdk()
        const { data } = await sdk.full.users.getPurchasesCount({
          id: encodeHashId(userId!),
          userId: encodeHashId(userId!),
          encodedDataMessage,
          encodedDataSignature
        })
        return data ?? 0
      },
      options: {}
    },
    getSales: {
      fetch: async (
        {
          offset,
          limit,
          userId,
          sortDirection,
          sortMethod
        }: GetPurchaseListArgs,
        context
      ) => {
        const { data: encodedDataMessage, signature: encodedDataSignature } =
          await context.audiusBackend.signDiscoveryNodeRequest()
        const sdk = await context.audiusSdk()
        const { data = [] } = await sdk.full.users.getSales({
          limit,
          offset,
          sortDirection,
          sortMethod,
          id: encodeHashId(userId!),
          userId: encodeHashId(userId!),
          encodedDataMessage,
          encodedDataSignature
        })

        const purchases = data.map(parsePurchase)

        // Pre-fetch track metadata
        const trackIdsToFetch = purchases
          .filter(
            ({ contentType }) => contentType === USDCContentPurchaseType.TRACK
          )
          .map(({ contentId }) => contentId)
        await trackApiFetch.getTracksByIds(
          { ids: trackIdsToFetch, currentUserId: userId },
          context
        )
        return purchases
      },
      options: {}
    },
    getSalesCount: {
      fetch: async (
        { userId }: Pick<GetPurchaseListArgs, 'userId'>,
        { audiusSdk, audiusBackend }
      ) => {
        const { data: encodedDataMessage, signature: encodedDataSignature } =
          await audiusBackend.signDiscoveryNodeRequest()
        const sdk = await audiusSdk()
        const { data } = await sdk.full.users.getSalesCount({
          id: encodeHashId(userId!),
          userId: encodeHashId(userId!),
          encodedDataMessage,
          encodedDataSignature
        })
        return data ?? 0
      },
      options: {}
    }
  }
})

export const {
  useGetPurchases,
  useGetPurchasesCount,
  useGetSales,
  useGetSalesCount
} = purchasesApi.hooks
export const purchasesApiReducer = purchasesApi.reducer
