import {
  audioTransactionsPageActions,
  TransactionType,
  transactionDetailsActions,
  Nullable
} from '@audius/common'
import type { InAppAudioPurchaseMetadata } from '@audius/common'
import { AudiusLibs } from '@audius/sdk'
import { call, takeLatest, put } from 'typed-redux-saga'

import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'

const { fetchAudioTransactionMetadata } = audioTransactionsPageActions
const { fetchTransactionDetailsSucceeded } = transactionDetailsActions

function* fetchTransactionMetadata() {
  yield* takeLatest(
    fetchAudioTransactionMetadata.type,
    function* (action: ReturnType<typeof fetchAudioTransactionMetadata>) {
      const { txDetails } = action.payload
      if (txDetails.transactionType !== TransactionType.PURCHASE) {
        return
      }
      yield* call(waitForLibsInit)
      const libs: AudiusLibs = yield* call(audiusBackendInstance.getAudiusLibs)
      const response: InAppAudioPurchaseMetadata | null = yield* call(
        [
          libs.identityService!,
          libs.identityService!.getUserBankTransactionMetadata
        ],
        txDetails.signature
      )
      yield put(
        fetchTransactionDetailsSucceeded({
          transactionId: txDetails.signature,
          transactionDetails: {
            ...txDetails,
            metadata: response as Nullable<InAppAudioPurchaseMetadata>
          }
        })
      )
    }
  )
}

const sagas = () => {
  const sagas = [fetchTransactionMetadata]
  return sagas
}

export default sagas
