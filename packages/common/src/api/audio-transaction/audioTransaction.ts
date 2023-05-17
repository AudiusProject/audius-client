import { TransactionDetails } from 'store/ui/transaction-details/types'

import { createApi } from '../createApi'

import { parseTransaction } from './utils'

const audiotransactionApi = createApi({
  reducerPath: 'audiotransactionApi',
  endpoints: {
    getAudioTransactionHistory: {
      fetch: async (
        { offset, limit, sortMethod, sortDirection },
        { audiusBackend, audiusSdk }
      ) => {
        const { data, signature } =
          await audiusBackend.signDiscoveryNodeRequest()

        const response =
          await audiusSdk.full.transactions.getAudioTransactionHistory({
            encodedDataMessage: data,
            encodedDataSignature: signature,
            sortMethod,
            sortDirection,
            limit,
            offset
          })
        const txDetails: TransactionDetails[] =
          response.data?.map((tx) => parseTransaction(tx)) ?? []

        return txDetails
      }
    }
  }
})

export const { getAudioTransactionHistory } = audiotransactionApi.hooks
export default audiotransactionApi.reducer
