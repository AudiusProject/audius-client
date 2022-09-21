// @ts-nocheck
// TODO(nkang) - convert to TS
import { asLineup } from 'store/lineup/reducer'
import feedReducer from 'store/pages/profile/lineups/feed/reducer'
import tracksReducer from 'store/pages/profile/lineups/tracks/reducer'
import { FollowType, CollectionSortMode } from 'store/pages/profile/types'
import { FOLLOW_USER, FOLLOW_USER_FAILED } from 'store/social/users/actions'

import { Status } from '../../../models'

import {
  FETCH_PROFILE,
  FETCH_PROFILE_SUCCEEDED,
  FETCH_PROFILE_FAILED,
  UPDATE_PROFILE,
  UPDATE_PROFILE_SUCCEEDED,
  UPDATE_PROFILE_FAILED,
  RESET_PROFILE,
  UPDATE_COLLECTION_SORT_MODE,
  SET_PROFILE_FIELD,
  FETCH_FOLLOW_USERS,
  FETCH_FOLLOW_USERS_SUCCEEDED,
  FETCH_FOLLOW_USERS_FAILED,
  DISMISS_PROFILE_METER,
  UPDATE_MOST_USED_TAGS,
  SET_NOTIFICATION_SUBSCRIPTION
} from './actions'
import { PREFIX as feedPrefix } from './lineups/feed/actions'
import { PREFIX as tracksPrefix } from './lineups/tracks/actions'

const initialProfileState = {
  handle: null,
  userId: null,
  status: Status.IDLE,

  isNotificationSubscribed: false,
  updating: false,
  updateSuccess: false,
  updateError: false,
  mostUsedTags: [],

  collectionSortMode: CollectionSortMode.SAVE_COUNT,

  profileMeterDismissed: false,

  [FollowType.FOLLOWERS]: { status: Status.IDLE, userIds: [] },
  [FollowType.FOLLOWEES]: { status: Status.IDLE, userIds: [] },
  [FollowType.FOLLOWEE_FOLLOWS]: { status: Status.IDLE, userIds: [] }
}

const initialState = { currentUser: null, entries: {} }

const actionsMap = {
  [FETCH_PROFILE](state, action) {
    const { fetchOnly, shouldSetLoading, handle, userId } = action
    if (fetchOnly) return state

    const profileState = state.entries[handle] ?? initialProfileState

    const newState = {
      ...profileState,
      status: shouldSetLoading ? Status.LOADING : state.status
    }
    if (handle) {
      newState.handle = handle
    }
    if (userId) {
      newState.userId = userId
    }
    return {
      currentUser: handle,
      entries: { ...state.entries, [handle]: newState }
    }
  },
  [FETCH_PROFILE_SUCCEEDED](state, action) {
    const { currentUser, entries } = state
    const { fetchOnly, userId, handle } = action
    const profileHandle = handle ?? currentUser
    if (fetchOnly) return state

    const profileState = entries[profileHandle]

    return {
      ...state,
      entries: {
        ...entries,
        [profileHandle]: {
          ...profileState,
          status: Status.SUCCESS,
          userId,
          handle: profileHandle
        }
      }
    }
  },
  [FETCH_FOLLOW_USERS](state, action) {
    const { currentUser, entries } = state
    const { followerGroup, handle } = action
    const profileHandle = handle ?? currentUser
    const profileState = entries[profileHandle]

    return {
      ...state,
      entries: {
        ...entries,
        [profileHandle]: {
          ...profileState,
          [followerGroup]: {
            ...profileState[followerGroup],
            status: Status.LOADING
          }
        }
      }
    }
  },
  [FETCH_FOLLOW_USERS_SUCCEEDED](state, action) {
    const { currentUser, entries } = state
    const { userIds, followerGroup, handle } = action
    const profileHandle = handle ?? currentUser
    const filteredAddedUserIds = userIds.filter(({ id }) =>
      state[followerGroup].userIds.every(({ id: userId }) => id !== userId)
    )

    const profileState = entries[profileHandle]

    return {
      ...state,
      entries: {
        ...entries,
        [profileHandle]: {
          ...profileState,
          [followerGroup]: {
            userIds:
              profileState[followerGroup].userIds.concat(filteredAddedUserIds),
            status: Status.SUCCESS
          }
        }
      }
    }
  },
  [FETCH_FOLLOW_USERS_FAILED](state, action) {
    const { currentUser, entries } = state
    const { followerGroup, handle } = action
    const profileHandle = handle ?? currentUser
    const profileState = entries[profileHandle]

    return {
      ...state,
      entries: {
        [profileHandle]: {
          ...profileState,
          [followerGroup]: {
            ...profileState[followerGroup],
            status: Status.ERROR
          }
        }
      }
    }
  },
  [SET_PROFILE_FIELD](state, action) {
    const { currentUser, entries } = state
    const { field, value, handle } = action
    const profileHandle = handle ?? currentUser
    const profileState = entries[profileHandle]

    return {
      ...state,
      entries: {
        ...entries,
        [handle]: {
          ...profileState,
          [field]: value
        }
      }
    }
  },
  [FETCH_PROFILE_FAILED](state, action) {
    const { currentUser, entries } = state
    const { handle } = action
    const profileHandle = handle ?? currentUser
    const profileState = entries[profileHandle]

    return {
      ...state,
      entries: {
        ...entries,
        [profileHandle]: {
          ...profileState,
          status: Status.ERROR
        }
      }
    }
  },
  [UPDATE_MOST_USED_TAGS](state, action) {
    const { currentUser, entries } = state
    const { mostUsedTags, handle } = action
    const profileHandle = handle ?? currentUser
    const profileState = entries[profileHandle]

    return {
      ...state,
      entries: {
        ...entries,
        [profileHandle]: {
          ...profileState,
          mostUsedTags
        }
      }
    }
  },
  [UPDATE_PROFILE](state, action) {
    return {
      ...state,
      updating: true
    }
  },
  [UPDATE_PROFILE_SUCCEEDED](state, action) {
    return {
      ...state,
      updating: false,
      updateSuccess: true
    }
  },
  [UPDATE_PROFILE_FAILED](state, action) {
    return {
      ...state,
      updating: false,
      updateError: true
    }
  },
  [RESET_PROFILE](state, action) {
    return {
      ...initialState,
      profileMeterDismissed: state.profileMeterDismissed,
      feed: feedLineupReducer(undefined, action),
      tracks: tracksLineupReducer(undefined, action)
    }
  },
  [UPDATE_COLLECTION_SORT_MODE](state, action) {
    return {
      ...state,
      collectionSortMode: action.mode
    }
  },
  [DISMISS_PROFILE_METER](state, action) {
    return {
      ...state,
      profileMeterDismissed: true
    }
  },
  [FOLLOW_USER](state, action) {
    return {
      ...state,
      [FollowType.FOLLOWEES]: {
        ...state[FollowType.FOLLOWEES],
        userIds: state[FollowType.FOLLOWEES].userIds.concat([action.userId])
      }
    }
  },
  [FOLLOW_USER_FAILED](state, action) {
    return {
      ...state,
      [FollowType.FOLLOWEES]: {
        ...state[FollowType.FOLLOWEES],
        userIds: state[FollowType.FOLLOWEES].userIds.filter(
          (id) => id !== action.userId
        )
      }
    }
  },
  [SET_NOTIFICATION_SUBSCRIPTION](state, action) {
    return {
      ...state,
      isNotificationSubscribed: action.isSubscribed
    }
  }
}

const feedLineupReducer = asLineup(feedPrefix, feedReducer)
const tracksLineupReducer = asLineup(tracksPrefix, tracksReducer)

const reducer = (state = initialState, action) => {
  const { currentUser, entries } = state
  const { handle } = action

  const profileHandle = handle ?? currentUser
  if (!profileHandle) return state

  let profileState = entries[profileHandle] ?? initialProfileState

  const feed = feedLineupReducer(profileState.feed, action)
  if (feed !== profileState.feed) {
    profileState = { ...profileState, feed }
  }

  const tracks = tracksLineupReducer(profileState.tracks, action)
  if (tracks !== profileState.tracks) {
    profileState = { ...profileState, tracks }
  }

  const newState = {
    ...state,
    entries: { ...entries, [profileHandle]: profileState }
  }

  const matchingReduceFunction = actionsMap[action.type]
  if (!matchingReduceFunction) return newState
  return matchingReduceFunction(newState, action)
}

export default reducer
