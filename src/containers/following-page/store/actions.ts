import { createCustomAction } from 'typesafe-actions'
import { ID } from 'models/common/Identifiers'

export const SET_FOLOWING = 'FOLLOWING_USER_PAGE/SET_FOLOWING'
export const GET_FOLLOWING_ERROR = 'FOLLOWING_USER_PAGE/GET_FOLLOWING_ERROR'

export const setFollowing = createCustomAction(SET_FOLOWING, (id: ID) => ({
  id
}))
export const getFollowingError = createCustomAction(
  GET_FOLLOWING_ERROR,
  (id: ID, error: string) => ({ id, error })
)
