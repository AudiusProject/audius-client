import { initialCacheState } from 'store/cache/reducer'
import { CommonState } from 'store/commonStore'

import { ID } from '../../../models'

import { SET_COLLECTION_PERMALINKS } from './actions'

const initialState = {
  ...initialCacheState,
  permalinks: {}
}

const actionsMap = {
  [SET_COLLECTION_PERMALINKS](
    state: CommonState,
    action: { permalinksToIds: { [permalink: string]: ID } }
  ) {
    return {
      ...state,
      permalinks: {
        // @ts-ignore
        ...state.permalinks,
        ...action.permalinksToIds
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
