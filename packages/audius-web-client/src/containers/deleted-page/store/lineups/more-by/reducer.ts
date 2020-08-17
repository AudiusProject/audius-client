import { initialLineupState } from 'store/lineup/reducer'
import { RESET_SUCCEEDED, stripPrefix } from 'store/lineup/actions'
import { PREFIX } from 'containers/deleted-page/store/lineups/more-by/actions'

export const initialState = {
  ...initialLineupState,
  prefix: PREFIX
}

const actionsMap: { [key in string]: any } = {
  [RESET_SUCCEEDED](state: typeof initialState) {
    const newState = initialState
    return newState
  }
}

const moreBy = (state = initialState, action: { type: string }) => {
  const baseActionType = stripPrefix(PREFIX, action.type)
  const matchingReduceFunction = actionsMap[baseActionType]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}

export default moreBy
