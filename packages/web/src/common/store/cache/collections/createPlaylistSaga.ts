import {
  Collection,
  CollectionMetadata,
  DefaultSizes,
  EditPlaylistValues,
  ID,
  Kind,
  Name,
  Nullable,
  Track,
  accountActions,
  accountSelectors,
  cacheActions,
  cacheCollectionsActions,
  cacheCollectionsSelectors,
  cacheTracksSelectors,
  getContext,
  makeKindId,
  newCollectionMetadata,
  confirmerActions,
  confirmTransaction,
  RequestConfirmationError
} from '@audius/common'
import { call, put, select, takeLatest } from 'typed-redux-saga'

import { make } from 'common/store/analytics/actions'
import { addPlaylistsNotInLibrary } from 'common/store/playlist-library/sagas'
import { ensureLoggedIn } from 'common/utils/ensureLoggedIn'
import { playlistPage } from 'utils/route'
import { waitForWrite } from 'utils/sagaHelpers'

import { reformat } from './utils'
import { getUnclaimedPlaylistId } from './utils/getUnclaimedPlaylistId'

const { requestConfirmation } = confirmerActions
const { getAccountUser } = accountSelectors
const { getTrack } = cacheTracksSelectors
const { getCollection } = cacheCollectionsSelectors

export function* createPlaylistSaga() {
  yield* takeLatest(
    cacheCollectionsActions.CREATE_PLAYLIST,
    createPlaylistWorker
  )
}

function* createPlaylistWorker(
  action: ReturnType<typeof cacheCollectionsActions.createPlaylist>
) {
  yield* waitForWrite()
  const userId = yield* call(ensureLoggedIn)
  const { initTrackId, formFields, source, noticeType } = action
  const playlist = newCollectionMetadata(formFields)
  const playlistId = yield* call(getUnclaimedPlaylistId)
  if (!playlistId) return

  const initTrack = yield* select(getTrack, { id: initTrackId })

  if (initTrack) {
    playlist._cover_art_sizes = initTrack._cover_art_sizes
    playlist.cover_art_sizes = initTrack.cover_art_sizes
  }

  yield* call(optimisticallySavePlaylist, playlistId, playlist, initTrack)
  yield* put(
    cacheCollectionsActions.createPlaylistRequested(playlistId, noticeType)
  )
  yield* call(
    createAndConfirmPlaylist,
    playlistId,
    userId,
    playlist,
    initTrack,
    source
  )
}

function* optimisticallySavePlaylist(
  playlistId: ID,
  formFields: Partial<CollectionMetadata>,
  initTrack: Nullable<Track>
) {
  const accountUser = yield* select(getAccountUser)
  if (!accountUser) return
  const { user_id, handle, _collectionIds = [] } = accountUser
  const playlist: Partial<Collection> = {
    playlist_id: playlistId,
    ...formFields
  }

  playlist.playlist_owner_id = user_id
  playlist.is_private = true
  playlist.is_album = false
  playlist.playlist_contents = {
    track_ids: initTrack
      ? [{ time: initTrack?.duration, track: initTrack.track_id }]
      : []
  }
  playlist.track_count = initTrack ? 1 : 0
  playlist.permalink = playlistPage(handle, playlist.playlist_name, playlistId)
  if (playlist.artwork) {
    playlist._cover_art_sizes = {
      ...playlist._cover_art_sizes,
      [DefaultSizes.OVERRIDE]: playlist.artwork.url
    }
  }

  yield* put(
    cacheActions.add(
      Kind.COLLECTIONS,
      [{ id: playlistId, metadata: playlist }],
      /* replace= */ true, // forces cache update
      /* persistent cache */ false // Do not persistent cache since it's missing data
    )
  )

  yield* put(
    cacheActions.update(Kind.USERS, [
      {
        id: user_id,
        metadata: { _collectionIds: _collectionIds.concat(playlistId) }
      }
    ])
  )

  yield* put(
    accountActions.addAccountPlaylist({
      id: playlistId,
      name: playlist.playlist_name as string,
      is_album: false,
      user: { id: user_id, handle }
    })
  )

  yield* call(addPlaylistsNotInLibrary)
}

function* createAndConfirmPlaylist(
  playlistId: ID,
  userId: ID,
  formFields: EditPlaylistValues,
  initTrack: Nullable<Track>,
  source: string
) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const { createPlaylist, getPlaylists } = audiusBackendInstance

  const event = make(Name.PLAYLIST_START_CREATE, {
    source,
    artworkSource: formFields.artwork
      ? formFields.artwork.source
      : formFields.cover_art_sizes
  })
  yield* put(event)

  function* confirmPlaylist() {
    const { blockHash, blockNumber, error } = yield* call(
      createPlaylist,
      playlistId,
      formFields,
      false,
      initTrack ? [initTrack.track_id] : undefined
    )

    if (error || !playlistId) throw new Error('Unable to create playlist')

    const confirmed = yield* call(confirmTransaction, blockHash, blockNumber)
    if (!confirmed) {
      throw new Error(
        `Could not confirm playlist creation for playlist id ${playlistId}`
      )
    }

    // Merge the confirmed playlist with the optimistic playlist, preferring
    // optimistic data in case other unconfirmed edits have been made.
    const [confirmedPlaylist] = yield* call(getPlaylists, userId, [playlistId])
    const optimisticPlaylist = yield* select(getCollection, { id: playlistId })

    const reformattedPlaylist = {
      ...reformat(confirmedPlaylist, audiusBackendInstance),
      ...optimisticPlaylist,
      playlist_id: confirmedPlaylist.playlist_id
    }

    yield* put(
      cacheActions.update(Kind.COLLECTIONS, [
        {
          id: confirmedPlaylist.playlist_id,
          metadata: reformattedPlaylist
        }
      ])
    )

    yield* call(addPlaylistsNotInLibrary)

    yield* put(
      make(Name.PLAYLIST_COMPLETE_CREATE, {
        source,
        status: 'success'
      })
    )

    yield* put(cacheCollectionsActions.createPlaylistSucceeded())

    return confirmedPlaylist
  }

  function* onError(result: RequestConfirmationError) {
    const { message, error, timeout } = result
    yield* put(
      make(Name.PLAYLIST_COMPLETE_CREATE, {
        source,
        status: 'failure'
      })
    )
    yield* put(
      cacheCollectionsActions.createPlaylistFailed(
        error,
        { userId, formFields, source },
        { message, timeout }
      )
    )
  }

  yield* put(
    requestConfirmation(
      makeKindId(Kind.COLLECTIONS, playlistId),
      confirmPlaylist,
      function* () {},
      onError
    )
  )
}
