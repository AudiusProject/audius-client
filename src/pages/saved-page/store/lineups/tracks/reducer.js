import { RESET_SUCCEEDED, stripPrefix } from 'common/store/lineup/actions'
import { PREFIX } from 'pages/saved-page/store/lineups/tracks/actions'
import { initialLineupState } from 'store/lineup/reducer'

const initialState = {
  ...initialLineupState,
  prefix: PREFIX
}

const actionsMap = {
  [RESET_SUCCEEDED](state, action) {
    const newState = initialState
    return newState
  }
}

const tracks = (state = initialState, action) => {
  const baseActionType = stripPrefix(PREFIX, action.type)
  const matchingReduceFunction = actionsMap[baseActionType]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}

export default tracks
