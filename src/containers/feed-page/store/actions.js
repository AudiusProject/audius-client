export const FETCH_SUGGESTED_FOLLOW_USERS =
  'DISCOVER/FETCH_SUGGESTED_FOLLOW_USERS'
export const FOLLOW_USERS = 'DISCOVER/FOLLOW_USERS'
export const SET_SUGGESTED_FOLLOWS = 'DISCOVER/SET_SUGGESTED_FOLLOWS'
export const SET_FEED_FILTER = 'DISCOVER/SET_FEED_FILTER'

export const fetchSuggestedFollowUsers = () => ({
  type: FETCH_SUGGESTED_FOLLOW_USERS
})

export const followUsers = userIds => ({
  type: FOLLOW_USERS,
  userIds
})

export const setSuggestedFollows = userIds => ({
  type: SET_SUGGESTED_FOLLOWS,
  userIds
})

export const setFeedFilter = filter => ({
  type: SET_FEED_FILTER,
  filter
})
