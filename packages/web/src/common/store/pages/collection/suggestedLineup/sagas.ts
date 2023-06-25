import {
  collectionPageActions,
  collectionPageSelectors,
  collectionPageSuggestedLineupActions as tracksActions,
  CommonState,
  getContext,
  ID
} from '@audius/common'
import { keyBy } from 'lodash'
import { call, put, select } from 'typed-redux-saga'

import { retrieveTracks } from 'common/store/cache/tracks/utils'
import { LineupSagas } from 'common/store/lineup/sagas'
import { waitForRead } from 'utils/sagaHelpers'

const { setSavedTrackIds, addSuggestedIds } = collectionPageActions
const {
  getSavedTrackIds,
  getCollectionId,
  getCollectionSuggestedTracksLineup,
  getPrevSuggestedIds
} = collectionPageSelectors

function* getSuggestedTracks() {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  yield* waitForRead()

  let savedTrackIds = yield* select(getSavedTrackIds)

  // Fetch all user saved tracks if we haven't already
  if (savedTrackIds === null) {
    const savedTrackResults = yield* call(
      audiusBackendInstance.getSavedTracks,
      10000
    )
    const savedTrackResultIds: ID[] = savedTrackResults.map(
      (r: any) => r.save_item_id
    )
    yield* put(setSavedTrackIds(savedTrackResultIds))
    savedTrackIds = savedTrackResultIds
  }

  // TODO: KJ - Make sure to add the tracks that are already in the playlist to the prev suggested array
  // This might need to happen in the reset saga or something

  // Add the selector for the prevEntries
  const previouslyShownTrackIds = yield* select(getPrevSuggestedIds)

  // Filter the savedTracks from the previously displayed entries
  const filteredTrackIds = savedTrackIds?.filter(
    (id) => !(previouslyShownTrackIds ?? []).includes(id)
  )

  // Pick 5 random tracks to display
  const newSuggestedIds = filteredTrackIds
    .sort(() => (Math.random() > 0.5 ? 1 : -1))
    .slice(0, 5)

  yield* put(addSuggestedIds(newSuggestedIds))

  // TODO: KJ - Check to make sure that we have tracks left to display

  if (newSuggestedIds.length > 0) {
    const trackMetadatas = yield* call(retrieveTracks, {
      trackIds: newSuggestedIds
    })
    const keyedMetadatas = keyBy(trackMetadatas, (m) => m.track_id)

    return newSuggestedIds.map((id) => {
      const metadata = { ...keyedMetadatas[id] }

      // For whatever reason, the track id was retrieved and doesn't exist or is malformatted.
      // This can happen if the user has favorited an unlisted track
      if (!metadata.track_id) return null

      return metadata
    })
    // .filter(removeNullable)
  }

  return []
}

const sourceSelector = (state: CommonState) =>
  `collection:suggestions:${getCollectionId(state)}`

class SuggestedTracksSagas extends LineupSagas {
  constructor() {
    super(
      tracksActions.prefix,
      tracksActions,
      getCollectionSuggestedTracksLineup,
      getSuggestedTracks,
      undefined,
      undefined,
      sourceSelector
    )
  }
}

export default function sagas() {
  return new SuggestedTracksSagas().getSagas()
}
