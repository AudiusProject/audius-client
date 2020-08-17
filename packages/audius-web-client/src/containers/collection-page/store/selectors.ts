import { createSelector } from 'reselect'

import { getCollection as getCachedCollection } from 'store/cache/collections/selectors'
import { getUser as getCachedUser } from 'store/cache/users/selectors'
import { AppState, Status } from 'store/types'
import { UID } from 'models/common/Identifiers'

export const getCollectionUid = (state: AppState) =>
  state.collection.collectionUid
export const getCollectionId = (state: AppState) =>
  state.collection.collectionId
export const getUserUid = (state: AppState) => state.collection.userUid
export const getCollectionStatus = (state: AppState) => state.collection.status
export const getSmartCollectionVariant = (state: AppState) =>
  state.collection.smartCollectionVariant

export const getCollection = (state: AppState) =>
  getCachedCollection(state, { uid: getCollectionUid(state) })
export const getUser = (state: AppState) =>
  getCachedUser(state, { uid: getUserUid(state) })

export const makeGetCollection = () =>
  createSelector(
    [getCollectionUid, getUserUid, getCollectionStatus, getCollection, getUser],
    (collectionUid, userUid, status, metadata, user) => {
      return {
        collectionUid: collectionUid as UID,
        userUid: userUid as UID,
        status: status as Status,
        metadata,
        user
      }
    }
  )

export const getCollectionTracksLineup = (state: AppState) =>
  state.collection.tracks
