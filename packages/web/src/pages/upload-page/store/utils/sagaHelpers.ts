import { Name, accountSelectors, waitForAccount } from '@audius/common'
import { range } from 'lodash'
import { all, call, put, select } from 'typed-redux-saga'

import { make } from 'common/store/analytics/actions'
import { waitForBackendSetup } from 'common/store/backend/sagas'
const getAccountUser = accountSelectors.getAccountUser

export function* reportSuccessAndFailureEvents({
  numSuccess,
  numFailure,
  uploadType,
  errors
}: {
  numSuccess: number
  numFailure: number
  uploadType: 'single_track' | 'multi_track' | 'album' | 'playlist'
  errors: string[]
}) {
  yield* call(waitForBackendSetup)
  yield* waitForAccount()
  const accountUser = yield* select(getAccountUser)
  if (!accountUser) return
  const primary = accountUser.creator_node_endpoint?.split(',')[0]
  if (!primary) return
  const successEvents = range(numSuccess).map((_) =>
    make(Name.TRACK_UPLOAD_SUCCESS, {
      endpoint: primary,
      kind: uploadType
    })
  )

  const failureEvents = range(numFailure).map((i) =>
    make(Name.TRACK_UPLOAD_FAILURE, {
      endpoint: primary,
      kind: uploadType,
      error: errors[i]
    })
  )

  yield* all([...successEvents, ...failureEvents].map((e) => put(e)))
}
