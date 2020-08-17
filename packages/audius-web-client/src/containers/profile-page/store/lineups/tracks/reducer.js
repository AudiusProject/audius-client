import { initialLineupState } from 'store/lineup/reducer'
import { RESET_SUCCEEDED, stripPrefix } from 'store/lineup/actions'
import { PREFIX } from 'containers/profile-page/store/lineups/tracks/actions'

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
