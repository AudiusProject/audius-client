import { createReducer, ActionType } from 'typesafe-actions'

import * as actions from './actions'
import { UserListStoreState } from './types'

type UserListActions = ActionType<typeof actions>

export const UserListReducerFactory = {
  createReducer: ({
    tag,
    pageSize = 15
  }: {
    tag: string
    pageSize?: number
  }) => {
    const initialState: UserListStoreState = {
      page: 0,
      pageSize,
      userIds: [],
      hasMore: false,
      loading: false,
      tag
    }

    const withTagCheck = <A extends { tag: string }>(
      state: UserListStoreState,
      action: A,
      work: (state: UserListStoreState, action: A) => UserListStoreState
    ): UserListStoreState => {
      if (action.tag !== tag) return state
      return work(state, action)
    }

    return createReducer<UserListStoreState, UserListActions>(initialState, {
      [actions.RESET](state, action) {
        return withTagCheck(state, action, (state, action) => {
          return { ...initialState }
        })
      },
      [actions.SET_LOADING](state, action) {
        return withTagCheck(state, action, (state, action) => {
          return {
            ...state,
            loading: action.isLoading
          }
        })
      },
      [actions.SET_USER_IDS](state, action) {
        return withTagCheck(state, action, (state, action) => {
          return {
            ...state,
            userIds: action.userIds,
            hasMore: action.hasMore,
            loading: false
          }
        })
      },
      [actions.INCREMENT_PAGE](state, action) {
        return withTagCheck(state, action, (state, action) => {
          return {
            ...state,
            page: state.page + 1
          }
        })
      },
      // Changing the page size after we've started rendering
      // users is super not supported. If you try to do that,
      // UserList punishes you by resetting everything to initial values.
      [actions.SET_PAGE_SIZE](state, action) {
        return withTagCheck(state, action, (state, action) => {
          if (state.page !== 0) {
            return {
              ...initialState,
              pageSize: action.pageSize
            }
          }

          return {
            ...state,
            pageSize: action.pageSize
          }
        })
      }
    })
  }
}
