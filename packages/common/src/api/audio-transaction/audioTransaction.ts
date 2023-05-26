import { createApi } from 'src/audius-query/createApi'
import { TransactionDetails } from 'store/ui/transaction-details/types'

import { parseTransaction } from './utils'

const audiotransactionApi = createApi({
  reducerPath: 'audioTransactionApi',
  endpoints: {
    getAudioTransactionHistory: {
      fetch: async (
        { offset, limit, sortMethod, sortDirection },
        { audiusBackend, audiusSdk }
      ) => {
        const { data, signature } =
          await audiusBackend.signDiscoveryNodeRequest()

        const sdk = await audiusSdk()
        const response = await sdk.full.transactions.getAudioTransactionHistory(
          {
            encodedDataMessage: data,
            encodedDataSignature: signature,
            sortMethod,
            sortDirection,
            limit,
            offset
          }
        )
        const txDetails: TransactionDetails[] =
          response.data?.map((tx) => parseTransaction(tx)) ?? []

        return { transactions: txDetails }
      },
      options: {
        schemaKey: 'transactions'
      }
    },
    getAudioTransactionCount: {
      fetch: async (_args, { audiusBackend, audiusSdk }) => {
        const { data, signature } =
          await audiusBackend.signDiscoveryNodeRequest()

        const sdk = await audiusSdk()
        const response =
          await sdk.full.transactions.getAudioTransactionHistoryCount({
            encodedDataMessage: data,
            encodedDataSignature: signature
          })

        return { transactionCount: response.data }
      },
      options: {
        schemaKey: 'transactionCount'
      }
    }
  }
})

export const { useGetAudioTransactionHistory, useGetAudioTransactionCount } =
  audiotransactionApi.hooks
export const audioTransactionApiReducer = audiotransactionApi.reducer
