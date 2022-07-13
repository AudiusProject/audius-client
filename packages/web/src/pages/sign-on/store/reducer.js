import { getIsIOS } from 'utils/browser'
import { isMobile } from 'utils/clientUtil'
import { FEED_PAGE } from 'utils/route'

import {
  SET_ACCOUNT_READY,
  SET_FIELD,
  SET_VALUE_FIELD,
  SET_TWITTER_PROFILE,
  SET_INSTAGRAM_PROFILE,
  FETCH_FOLLOW_ARTISTS_SUCCEEDED,
  SET_FOLLOW_ARTIST_CATEGORY,
  VALIDATE_EMAIL,
  VALIDATE_EMAIL_SUCCEEDED,
  VALIDATE_EMAIL_FAILED,
  VALIDATE_HANDLE,
  VALIDATE_HANDLE_SUCCEEDED,
  VALIDATE_HANDLE_FAILED,
  RESET_SIGN_ON,
  OPEN_SIGN_ON,
  NEXT_PAGE,
  PREVIOUS_PAGE,
  GO_TO_PAGE,
  SET_STATUS,
  SIGN_UP,
  SIGN_UP_SUCCEEDED,
  SIGN_UP_FAILED,
  SIGN_IN,
  SIGN_IN_FAILED,
  SIGN_IN_SUCCEEDED,
  CONFIGURE_META_MASK,
  SET_TOAST,
  UPDATE_ROUTE_ON_COMPLETION,
  UPDATE_ROUTE_ON_EXIT,
  ADD_FOLLOW_ARTISTS,
  REMOVE_FOLLOW_ARTISTS,
  SET_REFERRER
} from './actions'
import { Pages, FollowArtistsCategory } from './types'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const createTextField = () => ({
  value: '',
  error: '',
  status: 'editing' // 'editing', 'loading', 'success', 'failure', 'disabled'
})

const initialState = {
  routeOnCompletion: FEED_PAGE,
  routeOnExit: null,
  isMobileSignOnVisible: false,
  email: createTextField(),
  name: createTextField(),
  password: createTextField(),
  handle: createTextField(),
  accountAlreadyExisted: false,
  verified: false,
  useMetaMask: false,
  accountReady: false,
  twitterId: '',
  twitterScreenName: '',
  instagramId: '',
  instagramScreenName: '',
  profileImage: null, // Object with file blob & url
  coverPhoto: null, // Object with file blob & url
  status: 'editing', // 'editing', 'loading', 'success', or 'failure'
  toastText: null,
  page: Pages.EMAIL,
  startedSignOnProcess: false,
  followArtists: {
    selectedCategory: FollowArtistsCategory.FEATURED,
    categories: {},
    selectedUserIds: []
  },
  referrer: null
}

const actionsMap = {
  [SET_ACCOUNT_READY](state) {
    return {
      ...state,
      accountReady: true
    }
  },
  [RESET_SIGN_ON](state) {
    return {
      ...initialState,
      // Don't reset route on completion or on exit so completing the form
      // even if toggling b/w sign up and sign in redirects to the right place
      routeOnCompletion: state.routeOnCompletion,
      routeOnExit: state.routeOnExit,
      isMobileSignOnVisible: state.isMobileSignOnVisible,
      followArtists: state.followArtists
    }
  },
  [OPEN_SIGN_ON](state, action) {
    return {
      ...state,
      ...action.fields,
      page: action.page || state.page
    }
  },
  [NEXT_PAGE](state) {
    let newPage
    switch (state.page) {
      case Pages.EMAIL:
        newPage = Pages.PASSWORD
        break
      case Pages.PASSWORD:
        newPage = Pages.PROFILE
        break
      case Pages.PROFILE:
        newPage = Pages.FOLLOW
        break
      case Pages.FOLLOW: {
        if (!NATIVE_MOBILE && !isMobile()) {
          newPage = Pages.APP_CTA
        } else if (NATIVE_MOBILE && getIsIOS()) {
          newPage = Pages.NOTIFICATION_SETTINGS
        } else {
          newPage = Pages.LOADING
        }
        break
      }
      case Pages.NOTIFICATION_SETTINGS:
        newPage = Pages.LOADING
        break
      case Pages.APP_CTA:
        newPage = Pages.LOADING
        break
      case Pages.LOADING:
        newPage = Pages.START
        break
      default:
        newPage = Pages.EMAIL
    }
    return {
      ...state,
      page: newPage
    }
  },
  [PREVIOUS_PAGE](state, action) {
    let newPage
    switch (state.page) {
      case Pages.PASSWORD:
        newPage = Pages.EMAIL
        break
      case Pages.PROFILE:
        newPage = Pages.PASSWORD
        break
      case Pages.FOLLOW:
        newPage = Pages.PROFILE
        break
      case Pages.LOADING:
        newPage = Pages.FOLLOW
        break
      case Pages.START:
        newPage = Pages.LOADING
        break
      default:
        newPage = Pages.EMAIL
    }
    return {
      ...state,
      page: newPage
    }
  },
  [GO_TO_PAGE](state, action) {
    return {
      ...state,
      page: action.page
    }
  },
  [SET_STATUS](state, action) {
    return initialState
  },
  [SET_FIELD](state, action) {
    return {
      ...state,
      [action.field]: action.value
    }
  },
  [SET_VALUE_FIELD](state, action) {
    return {
      ...state,
      [action.field]: {
        ...state[action.field],
        value: action.value,
        error: '',
        status: 'editing'
      }
    }
  },
  [SET_TWITTER_PROFILE](state, action) {
    return {
      ...state,
      twitterId: action.twitterId,
      name: {
        value: action.profile.name,
        status: 'editing',
        error: ''
      },
      handle: {
        ...state.handle,
        value: action.profile.screen_name
      },
      twitterScreenName: action.profile.screen_name,
      profileImage: action.profileImage,
      coverPhoto: action.coverPhoto,
      verified: action.profile.verified
    }
  },
  [SET_INSTAGRAM_PROFILE](state, action) {
    return {
      ...state,
      instagramId: action.instagramId,
      name: {
        value: action.profile.full_name || '',
        status: 'editing',
        error: ''
      },
      handle: {
        ...state.handle,
        value: action.profile.username
      },
      instagramScreenName: action.profile.username,
      profileImage: action.profileImage || null,
      verified: action.profile.is_verified
    }
  },
  [VALIDATE_EMAIL](state, action) {
    return {
      ...state,
      email: {
        ...state.email,
        status: 'loading'
      }
    }
  },
  [CONFIGURE_META_MASK](state, action) {
    return {
      ...state,
      useMetaMask: true
    }
  },
  [VALIDATE_EMAIL_SUCCEEDED](state, action) {
    return {
      ...state,
      email: {
        ...state.email,
        status: action.available ? 'success' : 'failure',
        error: action.available ? '' : 'inUse'
      }
    }
  },
  [VALIDATE_EMAIL_FAILED](state, action) {
    return {
      ...state,
      email: {
        ...state.email,
        status: 'failure',
        error: action.error
      }
    }
  },
  [VALIDATE_HANDLE](state, action) {
    return {
      ...state,
      handle: {
        ...state.handle,
        status: 'loading'
      }
    }
  },
  [VALIDATE_HANDLE_SUCCEEDED](state, action) {
    return {
      ...state,
      handle: {
        ...state.handle,
        status: 'success',
        error: ''
      }
    }
  },
  [VALIDATE_HANDLE_FAILED](state, action) {
    return {
      ...state,
      handle: {
        ...state.handle,
        status: 'failure',
        error: action.error
      }
    }
  },
  [SIGN_UP](state, action) {
    return {
      ...state,
      startedSignOnProcess: true,
      status: 'loading'
    }
  },
  [SIGN_UP_SUCCEEDED](state, action) {
    return {
      ...state,
      status: 'success'
    }
  },
  [SIGN_UP_FAILED](state, action) {
    return {
      ...state,
      status: 'failure'
    }
  },
  [SIGN_IN](state, action) {
    return {
      ...state,
      status: 'loading'
    }
  },
  [SIGN_IN_SUCCEEDED](state, action) {
    return {
      ...state,
      status: 'success'
    }
  },
  [SIGN_IN_FAILED](state, action) {
    return {
      ...state,
      status: 'failure',
      password: {
        ...state.password,
        status: 'failure',
        error: action.error
      }
    }
  },
  [SET_TOAST](state, action) {
    return {
      ...state,
      toastText: action.text
    }
  },
  [UPDATE_ROUTE_ON_COMPLETION](state, action) {
    return {
      ...state,
      routeOnCompletion: action.route
    }
  },
  [FETCH_FOLLOW_ARTISTS_SUCCEEDED](state, action) {
    return {
      ...state,
      followArtists: {
        ...state.followArtists,
        categories: {
          ...state.followArtists.categories,
          [action.category]: action.userIds
        }
      }
    }
  },
  [SET_FOLLOW_ARTIST_CATEGORY](state, action) {
    return {
      ...state,
      followArtists: {
        ...state.followArtists,
        selectedCategory: action.category
      }
    }
  },
  [ADD_FOLLOW_ARTISTS](state, action) {
    return {
      ...state,
      followArtists: {
        ...state.followArtists,
        selectedUserIds: [
          ...new Set(state.followArtists.selectedUserIds.concat(action.userIds))
        ]
      }
    }
  },
  [REMOVE_FOLLOW_ARTISTS](state, action) {
    const removeUserIds = new Set(action.userIds)
    return {
      ...state,
      followArtists: {
        ...state.followArtists,
        selectedUserIds: state.followArtists.selectedUserIds.filter(
          (id) => !removeUserIds.has(id)
        )
      }
    }
  },
  [UPDATE_ROUTE_ON_EXIT](state, action) {
    return {
      ...state,
      routeOnExit: action.route
    }
  },
  [SET_REFERRER](state, action) {
    return {
      ...state,
      referrer: action.userId
    }
  }
}

export default function signOnReducer(state = initialState, action) {
  const matchingReduceFunction = actionsMap[action.type]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}
