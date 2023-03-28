import { initialCacheState } from 'store/cache/reducer'

import { Collection, ID } from '../../../models'
import { AddSuccededAction, ADD_SUCCEEDED } from '../actions'

import { CollectionsCacheState } from './types'

const initialState = {
  ...initialCacheState,
  permalinks: {}
}

const actionsMap = {
  [ADD_SUCCEEDED](
    state: CollectionsCacheState,
    action: AddSuccededAction<Collection>
  ) {
    const { entries } = action

    const newPermalinks: Record<string, ID> = {}

    for (const entry of entries) {
      const { playlist_id, permalink } = entry.metadata

      if (permalink) {
        newPermalinks[permalink] = playlist_id
      }
    }

    return {
      ...state,
      permalinks: {
        ...state.permalinks,
        ...newPermalinks
      }
    }
  }
}

const reducer = (state = initialState, action: any) => {
  const matchingReduceFunction = actionsMap[action.type]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}
export default reducer
