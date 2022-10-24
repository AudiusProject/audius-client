import { accountSelectors, waitForAccount } from '@audius/common'
import { call, select } from 'typed-redux-saga'

import { waitForBackendSetup } from 'common/store/backend/sagas'
import { LineupSagas } from 'common/store/lineup/sagas'
import { retrieveUserTracks } from 'common/store/pages/profile/lineups/tracks/retrieveUserTracks'
import {
  PREFIX,
  moreByActions
} from 'pages/deleted-page/store/lineups/more-by/actions'
import { getLineup } from 'pages/deleted-page/store/selectors'
const getUserId = accountSelectors.getUserId

function* getTracks({
  payload
}: {
  offset: number
  limit: number
  payload: { handle: string }
}) {
  const { handle } = payload

  yield* call(waitForBackendSetup)
  yield* waitForAccount()
  const currentUserId = yield* select(getUserId)
  const processed = yield* call(retrieveUserTracks, {
    handle,
    currentUserId,
    sort: 'plays',
    limit: 5
  })

  return processed
}

const sourceSelector = () => PREFIX

class MoreBySagas extends LineupSagas {
  constructor() {
    super(
      PREFIX,
      moreByActions,
      getLineup,
      getTracks,
      undefined,
      undefined,
      sourceSelector
    )
  }
}

export default function sagas() {
  return new MoreBySagas().getSagas()
}
