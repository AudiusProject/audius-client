import { call, select, takeEvery, put } from 'redux-saga/effects'

import * as socialActions from 'store/social/collections/actions'
import { Kind } from 'store/types'
import * as cacheActions from 'store/cache/actions'
import * as confirmerActions from 'store/confirmer/actions'
import * as accountActions from 'store/account/reducer'
import { getUserId, getUserPlaylistOrder } from 'store/account/selectors'
import { getUser } from 'store/cache/users/selectors'
import {
  getCollections,
  getCollection
} from 'store/cache/collections/selectors'
import { waitForBackendSetup } from 'store/backend/sagas'
import { pollPlaylist } from 'store/confirmer/sagas'
import AudiusBackend from 'services/AudiusBackend'
import { makeUid, makeKindId } from 'utils/uid'
import * as signOnActions from 'containers/sign-on/store/actions'
import { adjustUserField } from 'store/cache/users/sagas'
import watchCollectionErrors from './errorSagas'
import { ID } from 'models/common/Identifiers'
import User from 'models/User'
import Collection from 'models/Collection'
import { albumPage, playlistPage } from 'utils/route'
import { share } from 'utils/share'
import { formatShareText } from 'utils/formatUtil'
import { make } from 'store/analytics/actions'
import { Name } from 'services/analytics'

/* REPOST COLLECTION */

export function* watchRepostCollection() {
  yield takeEvery(socialActions.REPOST_COLLECTION, repostCollectionAsync)
}

export function* repostCollectionAsync(
  action: ReturnType<typeof socialActions.repostCollection>
) {
  yield call(waitForBackendSetup)
  const userId = yield select(getUserId)
  if (!userId) {
    yield put(signOnActions.openSignOn(false))
    yield put(signOnActions.showRequiresAccountModal())
    yield put(make(Name.CREATE_ACCOUNT_OPEN, { source: 'social action' }))
    return
  }

  // increment the repost count on the user
  const user = yield select(getUser, { id: userId })
  yield call(adjustUserField, { user, fieldName: 'repost_count', delta: 1 })

  let collection = action.metadata
  if (!collection) {
    const collections = yield select(getCollections, {
      ids: [action.collectionId]
    })
    collection = collections[action.collectionId]
  }

  const event = make(Name.REPOST, {
    kind: collection.is_album ? 'album' : 'playlist',
    source: action.source,
    id: action.collectionId
  })
  yield put(event)

  yield call(
    confirmRepostCollection,
    collection.playlist_owner_id,
    action.collectionId,
    user
  )

  yield put(
    cacheActions.update(Kind.COLLECTIONS, [
      {
        id: action.collectionId,
        metadata: {
          has_current_user_reposted: true,
          repost_count: collection.repost_count + 1
        }
      }
    ])
  )
}

export function* confirmRepostCollection(
  ownerId: ID,
  collectionId: ID,
  user: User
) {
  yield put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.COLLECTIONS, collectionId),
      function* () {
        yield call(AudiusBackend.repostCollection, collectionId)
        return yield call(
          pollPlaylist,
          collectionId,
          ownerId,
          (playlist: Collection) => playlist.has_current_user_reposted
        )
      },
      function* () {},
      // @ts-ignore: remove when confirmer is typed
      function* ({ timeout, message }: { timeout: boolean; message: string }) {
        // Revert the incremented repost count
        yield call(adjustUserField, {
          user,
          fieldName: 'repost_count',
          delta: -1
        })
        yield put(
          socialActions.repostCollectionFailed(
            collectionId,
            timeout ? 'Timeout' : message
          )
        )
      }
    )
  )
}

export function* watchUndoRepostCollection() {
  yield takeEvery(
    socialActions.UNDO_REPOST_COLLECTION,
    undoRepostCollectionAsync
  )
}

export function* undoRepostCollectionAsync(
  action: ReturnType<typeof socialActions.undoRepostCollection>
) {
  yield call(waitForBackendSetup)
  const userId = yield select(getUserId)
  if (!userId) {
    yield put(signOnActions.openSignOn(false))
    yield put(signOnActions.showRequiresAccountModal())
    yield put(make(Name.CREATE_ACCOUNT_OPEN, { source: 'social action' }))
    return
  }

  // decrement the repost count on the user
  const user = yield select(getUser, { id: userId })
  yield call(adjustUserField, { user, fieldName: 'repost_count', delta: -1 })

  const collections = yield select(getCollections, {
    ids: [action.collectionId]
  })
  const collection = collections[action.collectionId]

  const event = make(Name.UNDO_REPOST, {
    kind: collection.is_album ? 'album' : 'playlist',
    source: action.source,
    id: action.collectionId
  })
  yield put(event)

  yield call(
    confirmUndoRepostCollection,
    collection.playlist_owner_id,
    action.collectionId,
    user
  )

  yield put(
    cacheActions.update(Kind.COLLECTIONS, [
      {
        id: action.collectionId,
        metadata: {
          has_current_user_reposted: false,
          repost_count: collection.repost_count - 1
        }
      }
    ])
  )
}

export function* confirmUndoRepostCollection(
  ownerId: ID,
  collectionId: ID,
  user: User
) {
  yield put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.COLLECTIONS, collectionId),
      function* () {
        yield call(AudiusBackend.undoRepostCollection, collectionId)
        return yield call(
          pollPlaylist,
          collectionId,
          ownerId,
          (playlist: Collection) => !playlist.has_current_user_reposted
        )
      },
      function* () {},
      // @ts-ignore: remove when confirmer is typed
      function* ({ timeout, message }: { timeout: boolean; message: string }) {
        // Revert the decrement
        yield call(adjustUserField, {
          user,
          fieldName: 'repost_count',
          delta: 1
        })
        yield put(
          socialActions.repostCollectionFailed(
            collectionId,
            timeout ? 'Timeout' : message
          )
        )
      }
    )
  )
}

/* SAVE COLLECTION */

export function* watchSaveCollection() {
  yield takeEvery(socialActions.SAVE_COLLECTION, function* (
    action: ReturnType<typeof socialActions.saveCollection>
  ) {
    yield call(saveCollectionAsync, action)
  })
}

export function* watchSaveSmartCollection() {
  yield takeEvery(socialActions.SAVE_SMART_COLLECTION, function* (
    action: ReturnType<typeof socialActions.saveSmartCollection>
  ) {
    yield call(saveSmartCollection, action)
  })
}

export function* saveSmartCollection(
  action: ReturnType<typeof socialActions.saveSmartCollection>
) {
  yield call(waitForBackendSetup)
  const userId = yield select(getUserId)
  if (!userId) {
    yield put(signOnActions.showRequiresAccountModal())
    yield put(signOnActions.openSignOn(false))
    yield put(make(Name.CREATE_ACCOUNT_OPEN, { source: 'social action' }))
    return
  }
  const playlistOrder = yield select(getUserPlaylistOrder)
  const newPlaylistOrder = [action.smartCollectionName, ...playlistOrder]

  yield call(AudiusBackend.setAccountPlaylistFavorites, newPlaylistOrder)
  yield put(accountActions.setPlaylistOrder({ order: newPlaylistOrder }))

  const event = make(Name.FAVORITE, {
    kind: 'playlist',
    source: action.source,
    id: action.smartCollectionName
  })
  yield put(event)
}

export function* saveCollectionAsync(
  action: ReturnType<typeof socialActions.saveCollection>
) {
  yield call(waitForBackendSetup)
  const userId = yield select(getUserId)
  if (!userId) {
    yield put(signOnActions.showRequiresAccountModal())
    yield put(signOnActions.openSignOn(false))
    yield put(make(Name.CREATE_ACCOUNT_OPEN, { source: 'social action' }))
    return
  }

  const collections = yield select(getCollections, {
    ids: [action.collectionId]
  })
  const collection = collections[action.collectionId]
  const user = yield select(getUser, { id: collection.playlist_owner_id })

  yield put(accountActions.didFavoriteItem())

  const event = make(Name.FAVORITE, {
    kind: collection.is_album ? 'album' : 'playlist',
    source: action.source,
    id: action.collectionId
  })
  yield put(event)

  yield call(
    confirmSaveCollection,
    collection.playlist_owner_id,
    action.collectionId
  )

  const subscribedUid = makeUid(
    Kind.COLLECTIONS,
    collection.playlist_id,
    'account'
  )
  yield put(
    cacheActions.subscribe(Kind.COLLECTIONS, [
      { uid: subscribedUid, id: collection.playlist_id }
    ])
  )

  yield put(
    accountActions.addAccountPlaylist({
      id: collection.playlist_id,
      name: collection.playlist_name,
      is_album: collection.is_album,
      user: { id: user.user_id, handle: user.handle }
    })
  )
  yield put(
    cacheActions.update(Kind.COLLECTIONS, [
      {
        id: action.collectionId,
        metadata: {
          has_current_user_saved: true,
          save_count: collection.save_count + 1
        }
      }
    ])
  )
  yield put(socialActions.saveCollectionSucceeded(action.collectionId))
}

export function* confirmSaveCollection(ownerId: ID, collectionId: ID) {
  yield put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.COLLECTIONS, collectionId),
      function* () {
        yield call(AudiusBackend.saveCollection, collectionId)
        return yield call(
          pollPlaylist,
          collectionId,
          ownerId,
          (playlist: Collection) => playlist.has_current_user_saved
        )
      },
      function* () {},
      // @ts-ignore: remove when confirmer is typed
      function* ({ timeout, message }: { timeout: boolean; message: string }) {
        yield put(
          socialActions.saveCollectionFailed(
            collectionId,
            timeout ? 'Timeout' : message
          )
        )
      }
    )
  )
}

export function* watchUnsaveCollection() {
  yield takeEvery(socialActions.UNSAVE_COLLECTION, function* (
    action: ReturnType<typeof socialActions.unsaveCollection>
  ) {
    yield call(unsaveCollectionAsync, action)
  })
}

export function* watchUnsaveSmartCollection() {
  yield takeEvery(socialActions.UNSAVE_SMART_COLLECTION, function* (
    action: ReturnType<typeof socialActions.unsaveSmartCollection>
  ) {
    yield call(unsaveSmartCollection, action)
  })
}

export function* unsaveSmartCollection(
  action: ReturnType<typeof socialActions.unsaveSmartCollection>
) {
  yield call(waitForBackendSetup)
  const playlistOrder = yield select(getUserPlaylistOrder)
  const newPlaylistOrder = playlistOrder.filter(
    (p: string) => p !== action.smartCollectionName
  )

  yield call(AudiusBackend.setAccountPlaylistFavorites, newPlaylistOrder)
  yield put(accountActions.setPlaylistOrder({ order: newPlaylistOrder }))

  const event = make(Name.UNFAVORITE, {
    kind: 'playlist',
    source: action.source,
    id: action.smartCollectionName
  })
  yield put(event)
}

export function* unsaveCollectionAsync(
  action: ReturnType<typeof socialActions.unsaveCollection>
) {
  yield call(waitForBackendSetup)
  const collections = yield select(getCollections, {
    ids: [action.collectionId]
  })
  const collection = collections[action.collectionId]

  const event = make(Name.UNFAVORITE, {
    kind: collection.is_album ? 'album' : 'playlist',
    source: action.source,
    id: action.collectionId
  })
  yield put(event)

  yield call(
    confirmUnsaveCollection,
    collection.playlist_owner_id,
    action.collectionId
  )

  yield put(
    accountActions.removeAccountPlaylist({ collectionId: action.collectionId })
  )
  yield put(
    cacheActions.update(Kind.COLLECTIONS, [
      {
        id: action.collectionId,
        metadata: {
          has_current_user_saved: false,
          save_count: collection.save_count - 1
        }
      }
    ])
  )
  yield put(socialActions.unsaveCollectionSucceeded(action.collectionId))
}

export function* confirmUnsaveCollection(ownerId: ID, collectionId: ID) {
  yield put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.COLLECTIONS, collectionId),
      function* () {
        yield call(AudiusBackend.unsaveCollection, collectionId)
        return yield call(
          pollPlaylist,
          collectionId,
          ownerId,
          (playlist: Collection) => !playlist.has_current_user_saved
        )
      },
      function* () {},
      // @ts-ignore: remove when confirmer is typed
      function* ({ timeout, message }: { timeout: boolean; message: string }) {
        yield put(
          socialActions.unsaveCollectionFailed(
            collectionId,
            timeout ? 'Timeout' : message
          )
        )
      }
    )
  )
}

export function* watchShareCollection() {
  yield takeEvery(socialActions.SHARE_COLLECTION, function* (
    action: ReturnType<typeof socialActions.shareCollection>
  ) {
    const { collectionId } = action
    const collection = yield select(getCollection, { id: collectionId })
    const user = yield select(getUser, { id: collection.playlist_owner_id })
    const link = collection.is_album
      ? albumPage(user.handle, collection.playlist_name, collection.playlist_id)
      : playlistPage(
          user.handle,
          collection.playlist_name,
          collection.playlist_id
        )
    share(link, formatShareText(collection.playlist_name, user.name))

    const event = make(Name.SHARE, {
      kind: collection.is_album ? 'album' : 'playlist',
      source: action.source,
      id: collection.playlist_id,
      url: link
    })
    yield put(event)
  })
}

const sagas = () => {
  return [
    watchRepostCollection,
    watchUndoRepostCollection,
    watchSaveCollection,
    watchSaveSmartCollection,
    watchUnsaveCollection,
    watchUnsaveSmartCollection,
    watchCollectionErrors,
    watchShareCollection
  ]
}

export default sagas
