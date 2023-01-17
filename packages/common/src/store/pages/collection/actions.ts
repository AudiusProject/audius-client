import { ID, SmartCollectionVariant, UID } from '../../../models'
import { Nullable } from '../../../utils'

export const FETCH_COLLECTION = 'FETCH_COLLECTION'
export const FETCH_COLLECTION_SUCCEEDED = 'FETCH_COLLECTION_SUCCEEDED'
export const FETCH_COLLECTION_FAILED = 'FETCH_COLLECTION_FAILED'
export const RESET_COLLECTION = 'RESET_COLLECTION'
export const SET_SMART_COLLECTION = 'SET_SMART_COLLECTION'
export const SET_COLLECTION_PERMALINK = 'SET_COLLECTION_PERMALINK'

export const setCollectionPermalink = (permalink: string) => ({
  type: SET_COLLECTION_PERMALINK,
  permalink
})

export const fetchCollection = (id: number, permalink: string) => ({
  type: FETCH_COLLECTION,
  id,
  permalink
})

export const fetchCollectionSucceeded = (
  collectionId: ID,
  collectionUid: string,
  userUid: string
) => ({
  type: FETCH_COLLECTION_SUCCEEDED,
  collectionId,
  collectionUid,
  userUid
})

export const fetchCollectionFailed = (userUid: UID) => ({
  type: FETCH_COLLECTION_FAILED,
  userUid
})

export const resetCollection = (
  collectionUid: Nullable<UID>,
  userUid: Nullable<UID>
) => ({
  type: RESET_COLLECTION,
  collectionUid,
  userUid
})

export const setSmartCollection = (
  smartCollectionVariant: SmartCollectionVariant
) => ({
  type: SET_SMART_COLLECTION,
  smartCollectionVariant
})
