import { createReducer, ActionType } from 'typesafe-actions'

import { Chain, Collectible, ID } from '../../models'

import * as actions from './actions'
import { UPDATE_USER_ETH_COLLECTIBLES, UPDATE_USER_SOL_COLLECTIBLES, UPDATE_SOL_COLLECTIONS } from './actions'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { Nullable } from '../../utils'

type CollectiblesActions = ActionType<typeof actions>

export type CollectiblesState = {
  userCollectibles: {
    [id: ID]: {
      [Chain.Eth]: Collectible[],
      [Chain.Sol]: Collectible[]
    }
  },
  solCollections: {
    [mint: string]: (Metadata & { imageUrl: Nullable<string> })
  }
}

const initialState = {
  userCollectibles: {},
  solCollections: {}
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
  },
  [UPDATE_SOL_COLLECTIONS](state, action) {
    return {
      ...state,
      solCollections: {
        ...state.solCollections,
        ...action.metadatas
      }
    }
  }
})

export default collectiblesReducer
