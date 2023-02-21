import {
  makeUids,
  Kind,
  usersActions,
  tracksActions,
  cacheCollectionsActions
} from '@audius/common'
import { invert, mapValues } from 'lodash'
import { all, call, put } from 'redux-saga/effects'

const { addUsers } = usersActions
const { addTracks } = tracksActions
const { addCollections } = cacheCollectionsActions

const DEFAULT_ENTRY_TTL = 5 /* min */ * 60 /* seconds */ * 1000 /* ms */

const isMissingFields = (cacheEntry, requiredFields) => {
  if (!requiredFields) return false
  for (const field of requiredFields) {
    if (!(field in cacheEntry)) {
      return true
    }
  }
  return false
}

// If timestamp provided, check if expired
const isExpired = (timestamp) => {
  if (timestamp) return timestamp + DEFAULT_ENTRY_TTL < Date.now()
  return false
}

/**
 * Retrieves entries from the cache and if they are not found invokes a supplied
 * `retrieveFromSource` to make whatever expensive / network request that does
 * supply the resource.
 * @param {Object} args
 * @param {Array<ID>} args.ids ids (keys) to fetch from in the cache
 * @param {Function*} args.selectFromCache saga/generator that specifies the method to select from cache,
 *  e.g.
 *  `function * (ids) { return yield select(getValues, { ids }) }`
 * @param {Function} args.getEntriesTimestamp return a mapping from id => timestamp
 * @param {Function} args.retrieveFromSource function that can retrieve an entry from its source
 *  (not the cache).
 * @param {Kind} args.kind specific cache kind
 * @param {string} args.idField the field on the entry itself that is the `ID`
 * @param {Set?} args.requiredFields any required fields that must exist on the existing entry or else
 * it `retrieveFromSource` will be invoked
 * @param {boolean?} args.forceRetrieveFromSource Forces the cached entry to be re-fetched
 * @param {boolean?} args.shouldSetLoading whether or not to actually change the status to loading during a refetch
 * @param {boolean?} args.deleteExistingEntry whether or not to delete the entry in the cache. Generally, unsafe to do
 * because some parts of the UI may depend on fields that you might destroy with this.
 * @param {function*} args.onBeforeAddToCache callback to invoke with metadatas before they are added to the cache
 * optionally may return custom metadatas to be cached instead of what metadatas are passed to the function
 * @param {function*} args.onAfterAddToCache callback to invoke with metadatas after they are added to the cache
 *
 */
export function* retrieve({
  ids,
  selectFromCache,
  getEntriesTimestamp,
  retrieveFromSource,
  kind,
  idField,
  requiredFields = new Set(),
  forceRetrieveFromSource = false,
  shouldSetLoading = true,
  deleteExistingEntry = false,
  onBeforeAddToCache = function* (metadatas) {},
  onAfterAddToCache = function* (metadatas) {}
}) {
  if (!ids.length) {
    return {
      entries: [],
      uids: []
    }
  }

  const uniqueIds = [...new Set(ids)]
  // Create uids for each id and collect a mapping.
  const uids = makeUids(kind, uniqueIds).reduce((map, uid, i) => {
    map[uniqueIds[i]] = uid
    return map
  }, {})

  // Get cached entries
  const [cachedEntries, timestamps] = yield all([
    call(selectFromCache, uniqueIds),
    call(getEntriesTimestamp, uniqueIds)
  ])

  // Figure out which IDs we need to retrive from source
  const idsToFetch = []
  uniqueIds.forEach((id) => {
    if (
      !(id in cachedEntries) ||
      isMissingFields(cachedEntries[id], requiredFields) ||
      isExpired(timestamps[id]) ||
      forceRetrieveFromSource
    ) {
      idsToFetch.push(id)
    }
  })

  // Retrieve IDs from source
  if (idsToFetch.length > 0) {
    yield call(retrieveFromSourceThenCache, {
      idsToFetch,
      kind,
      retrieveFromSource,
      onBeforeAddToCache,
      onAfterAddToCache,
      shouldSetLoading,
      deleteExistingEntry,
      idField,
      uids
    })
  }

  // Get the final cached items
  const entries = yield call(selectFromCache, uniqueIds)

  return {
    entries,
    uids
  }
}

function* retrieveFromSourceThenCache({
  idsToFetch,
  kind,
  retrieveFromSource,
  onBeforeAddToCache,
  onAfterAddToCache,
  shouldSetLoading,
  deleteExistingEntry,
  idField,
  uids
}) {
  let metadatas = yield call(retrieveFromSource, idsToFetch)
  if (metadatas) {
    if (!Array.isArray(metadatas)) {
      metadatas = [metadatas]
    }
    // If we didn't get any entries, return early
    if (!metadatas.length) {
      return
    }

    // Perform any side effects
    const beforeAdd = yield call(onBeforeAddToCache, metadatas)
    if (beforeAdd) {
      metadatas = beforeAdd
    }

    if (kind === Kind.USERS) {
      yield put(addUsers({ users: metadatas }))
      return
    }

    if (kind === Kind.TRACKS) {
      yield put(
        addTracks({ tracks: metadatas, uids: mapValues(invert(uids), Number) })
      )
      return
    }
    if (kind === Kind.COLLECTIONS) {
      yield put(
        addCollections({
          collections: metadatas,
          uids: mapValues(invert(uids), Number)
        })
      )
      return
    }

    // Perform any side effects
    yield call(onAfterAddToCache, metadatas)
  }
}

const sagas = () => {
  return []
}

export default sagas
