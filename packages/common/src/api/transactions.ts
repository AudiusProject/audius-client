import { full } from '@audius/sdk'

import { createApi } from 'audius-query'
import { ID } from 'models/Identifiers'
import { USDCPurchaseDetails } from 'models/USDCTransactions'
import { encodeHashId } from 'utils/hashIds'

type GetTransactionsArgs = {
  userId: ID
  offset: number
  limit: number
  sortMethod?: full.GetPurchasesSortMethodEnum
  sortDirection?: full.GetPurchasesSortDirectionEnum
}

const transactionsApi = createApi({
  reducerPath: 'transactionsApi',
  endpoints: {
    getPurchases: {
      fetch: async (
        { offset, limit, userId }: GetTransactionsArgs,
        { audiusSdk }
      ) => {
        console.log('TODO: fetch purchases for:', userId, offset, limit)
        const sdk = await audiusSdk()
        const purchases = await sdk.full.users.getPurchases({
          limit,
          offset,
          id: encodeHashId(userId),
          userId: encodeHashId(userId)
        })
        console.log(purchases)
        return [] as USDCPurchaseDetails[]
      },
      options: {}
    }
  }
})

export const { useGetPurchases } = transactionsApi.hooks
export const transactionsApiReducer = transactionsApi.reducer
