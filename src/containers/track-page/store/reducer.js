import { asLineup } from 'store/lineup/reducer'
import tracksReducer from 'containers/track-page/store/lineups/tracks/reducer'
import { PREFIX as tracksPrefix } from './lineups/tracks/actions'
import { SET_TRACK_ID, RESET, SET_TRACK_RANK } from './actions'

const initialState = {
  trackId: null,
  rank: {
    week: null,
    month: null,
    year: null
  }
}

const actionsMap = {
  [SET_TRACK_ID](state, action) {
    return {
      ...state,
      trackId: action.trackId
    }
  },
  [SET_TRACK_RANK](state, action) {
    return {
      ...state,
      rank: {
        ...state.rank,
        [action.duration]: action.rank
      }
    }
  },
  [RESET](state, action) {
    return {
      ...state,
      ...initialState
    }
  }
}

const tracksLineupReducer = asLineup(tracksPrefix, tracksReducer)

const reducer = (state = initialState, action) => {
  const tracks = tracksLineupReducer(state.tracks, action)
  if (tracks !== state.tracks) return { ...state, tracks }

  const matchingReduceFunction = actionsMap[action.type]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}

export default reducer
