import { Nullable } from 'utils'

import { ID, User, UserMetadata } from '../../../models'

import { CollectionSortMode, FollowType } from './types'

export const FETCH_PROFILE = 'PROFILE/FETCH_PROFILE'
export const FETCH_PROFILE_SUCCEEDED = 'PROFILE/FETCH_PROFILE_SUCCEEDED'
export const FETCH_PROFILE_FAILED = 'PROFILE/FETCH_PROFILE_FAILED'

export const UPDATE_PROFILE = 'PROFILE/UPDATE_PROFILE'
export const UPDATE_PROFILE_SUCCEEDED = 'PROFILE/UPDATE_PROFILE_SUCCEEDED'
export const UPDATE_PROFILE_FAILED = 'PROFILE/UPDATE_PROFILE_FAILED'

export const UPDATE_COLLECTION_SORT_MODE = 'PROFILE/UPDATE_COLLECTION_SORT_MODE'
export const SET_PROFILE_FIELD = 'PROFILE/SET_PROFILE_FIELD'
export const UPDATE_CURRENT_USER_FOLLOWS = 'PROFILE/UPDATE_CURRENT_USER_FOLLOWS'

export const FETCH_FOLLOW_USERS = 'PROFILE/FETCH_FOLLOW_USERS'
export const FETCH_FOLLOW_USERS_SUCCEEDED =
  'PROFILE/FETCH_FOLLOW_USERS_SUCCEEDED'
export const FETCH_FOLLOW_USERS_FAILED = 'PROFILE/FETCH_FOLLOW_USERS_FAILED'

export const DISMISS_PROFILE_METER = 'PROFILE/DISMISS_PROFILE_METER'

export const UPDATE_MOST_USED_TAGS = 'PROFILE/UPDATE_MOST_USED_TAGS'
export const SET_NOTIFICATION_SUBSCRIPTION =
  'PROFILE/SET_NOTIFICATION_SUBSCRIPTION'

// Either handle or userId is required
// TODO: Move this to redux toolkit
export function fetchProfile(
  handle: Nullable<string>,
  userId: Nullable<ID>,
  forceUpdate: boolean,
  shouldSetLoading: boolean,
  deleteExistingEntry: boolean,
  fetchOnly = false
) {
  return {
    type: FETCH_PROFILE,
    handle,
    userId,
    forceUpdate,
    shouldSetLoading,
    deleteExistingEntry,
    fetchOnly
  }
}

export function fetchProfileSucceeded(
  handle: string,
  userId: ID,
  fetchOnly: boolean
) {
  return { type: FETCH_PROFILE_SUCCEEDED, handle, userId, fetchOnly }
}

export function fetchProfileFailed(handle: string) {
  return { type: FETCH_PROFILE_FAILED, handle }
}

export function updateProfile(metadata: UserMetadata) {
  return { type: UPDATE_PROFILE, metadata }
}

export function updateProfileSucceeded(userId: ID) {
  return { type: UPDATE_PROFILE_SUCCEEDED, userId }
}

export function updateProfileFailed() {
  return { type: UPDATE_PROFILE_FAILED }
}

export function updateCollectionSortMode(
  mode: CollectionSortMode,
  handle: string
) {
  return { type: UPDATE_COLLECTION_SORT_MODE, mode, handle }
}

export function setProfileField(field: string, value: string, handle: string) {
  return { type: SET_PROFILE_FIELD, field, value, handle }
}

export function updateCurrentUserFollows(follow = false, handle: string) {
  return { type: UPDATE_CURRENT_USER_FOLLOWS, follow, handle }
}

export function fetchFollowUsers(
  followerGroup: FollowType,
  limit = 15,
  offset = 0,
  handle: string
) {
  return { type: FETCH_FOLLOW_USERS, followerGroup, offset, limit, handle }
}

export function fetchFollowUsersSucceeded(
  followerGroup: User[],
  userIds: ID[],
  limit: number,
  offset: number,
  handle: string
) {
  return {
    type: FETCH_FOLLOW_USERS_SUCCEEDED,
    followerGroup,
    userIds,
    limit,
    offset,
    handle
  }
}

export function fetchFollowUsersFailed(
  followerGroup: User[],
  limit: number,
  offset: number,
  handle: string
) {
  return {
    type: FETCH_FOLLOW_USERS_FAILED,
    followerGroup,
    limit,
    offset,
    handle
  }
}

export function profileMeterDismissed() {
  return { type: DISMISS_PROFILE_METER }
}

export function updateMostUsedTags(mostUsedTags: string[]) {
  return { type: UPDATE_MOST_USED_TAGS, mostUsedTags }
}

export function setNotificationSubscription(
  userId: ID,
  isSubscribed: boolean,
  update = false,
  handle?: string,
  onFollow = true
) {
  return {
    type: SET_NOTIFICATION_SUBSCRIPTION,
    userId,
    isSubscribed,
    update,
    handle,
    onFollow
  }
}
