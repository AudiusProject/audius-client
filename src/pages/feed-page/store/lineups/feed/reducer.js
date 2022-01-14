import { RESET_SUCCEEDED, stripPrefix } from 'common/store/lineup/actions'
import { PREFIX } from 'pages/feed-page/store/lineups/feed/actions'
import { initialLineupState } from 'store/lineup/reducer'

const initialState = {
  ...initialLineupState,
  prefix: PREFIX,
  dedupe: true,
  containsDeleted: false,
  entryIds: new Set([])
}

const actionsMap = {
  [RESET_SUCCEEDED](state, action) {
    const newState = initialState
    return newState
  }
}

const feed = (state = initialState, action) => {
  const baseActionType = stripPrefix(PREFIX, action.type)
  const matchingReduceFunction = actionsMap[baseActionType]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}

export default feed
