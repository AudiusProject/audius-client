import { createReducer, ActionType } from 'typesafe-actions'

import { Chain, Collectible, ID } from 'models'

import * as actions from './actions'
import { UPDATE_USER_ETH_COLLECTIBLES, UPDATE_USER_SOL_COLLECTIBLES } from './actions'

type CollectiblesActions = ActionType<typeof actions>

export type CollectiblesState = {
  userCollectibles: {
    [id: ID]: {
      [Chain.Eth]: Collectible[],
      [Chain.Sol]: Collectible[]
    }
  }
}

const initialState = {
  userCollectibles: {}
}

const collectiblesReducer = createReducer<
  CollectiblesState,
  CollectiblesActions
>(initialState, {
  [UPDATE_USER_ETH_COLLECTIBLES](state, action) {
    return {
      ...state,
      userCollectibles: {
        ...state.userCollectibles,
        [action.userId]: {
          ...state.userCollectibles[action.userId],
          [Chain.Eth]: action.userCollectibles
        }
      }
    }
  },
  [UPDATE_USER_SOL_COLLECTIBLES](state, action) {
    return {
      ...state,
      userCollectibles: {
        ...state.userCollectibles,
        [action.userId]: {
          ...state.userCollectibles[action.userId],
          [Chain.Sol]: action.userCollectibles
        }
      }
    }
  }
})

export default collectiblesReducer
