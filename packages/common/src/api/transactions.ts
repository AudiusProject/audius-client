// import { full } from '@audius/sdk'
import { createApi } from 'audius-query'
import { ID } from 'models/Identifiers'
import { USDCPurchaseDetails } from 'models/USDCTransactions'
import { Nullable } from 'utils/typeUtils'

type GetTransactionsArgs = {
  userId: Nullable<ID>
  offset: number
  limit: number
  // sortMethod?: full.GetUserLibraryAlbumsSortMethodEnum
  // sortDirection?: full.GetUserLibraryAlbumsSortDirectionEnum
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
        await audiusSdk()
        return [] as USDCPurchaseDetails[]
      },
      options: {}
    }
  }
})

export const { useGetPurchases } = transactionsApi.hooks
export const transactionsApiReducer = transactionsApi.reducer
