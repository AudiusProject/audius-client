import { createCustomAction } from 'typesafe-actions'

import { ID } from '../../../models'

export const SET_SUGGESTEDFOLLOWS =
  'SUGGESTED_FOLLOWS_USERS_PAGE/SET_SUGGESTED_FOLLOWS'
export const GET_SUGGESTEDFOLLOWS_ERROR =
  'SUGGESTED_FOLLOWS_USERS_PAGE/GET_SUGGESTED_FOLLOWS_ERROR'

export const setSuggestedFollows = createCustomAction(
  SET_SUGGESTEDFOLLOWS,
  (id: ID) => ({
    id
  })
)

export const getSuggestedFollowsError = createCustomAction(
  GET_SUGGESTEDFOLLOWS_ERROR,
  (id: ID, error: string) => ({ id, error })
)
