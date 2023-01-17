import { initialCacheState } from 'store/cache/reducer'
import { CommonState } from 'store/reducers'

import { SET_PERMALINK_STATUS } from './actions'

const initialState = {
  ...initialCacheState,
  permalinks: {}
}

const actionsMap = {
  [SET_PERMALINK_STATUS](state: CommonState, action: { statuses: any[] }) {
    return {
      ...state,
      permalinks: {
        ...state.collections.permalinks,
        ...action.statuses.reduce(
          (
            permalinkStatuses: {},
            status: { permalink: string; id: number; status: string }
          ) => {
            permalinkStatuses[status.permalink.toLowerCase()] = {
              id: status.id,
              status: status.status
            }
            return permalinkStatuses
          },
          {}
        )
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
