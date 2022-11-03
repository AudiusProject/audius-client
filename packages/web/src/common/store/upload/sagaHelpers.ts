import { Name, accountSelectors } from '@audius/common'
import { range } from 'lodash'
import { all, put, select } from 'typed-redux-saga'

import { make } from 'common/store/analytics/actions'
import { waitForBackendAndAccount } from 'utils/sagaHelpers'
const { getAccountUser } = accountSelectors

export function* reportResultEvents({
  numSuccess,
  numFailure,
  numRejected,
  uploadType,
  errors
}: {
  numSuccess: number
  numFailure: number
  numRejected: number
  uploadType: 'single_track' | 'multi_track' | 'album' | 'playlist'
  errors: string[]
}) {
  yield* waitForBackendAndAccount()
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

  const rejectedEvents = range(numRejected).map((i) =>
    make(Name.TRACK_UPLOAD_REJECTED, {
      endpoint: primary,
      kind: uploadType,
      error: errors[i]
    })
  )

  yield* all(
    [...successEvents, ...failureEvents, ...rejectedEvents].map((e) => put(e))
  )
}
