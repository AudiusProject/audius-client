import { zipObject } from 'lodash'

import { Track } from 'models/Track'
import { initialCacheState } from 'store/cache/reducer'

import { AddSuccededAction, ADD_SUCCEEDED } from '../actions'

import { TracksCacheState } from './types'

const initialState = {
  ...initialCacheState,
  permalinks: {}
} as unknown as TracksCacheState

const actionsMap = {
  [ADD_SUCCEEDED](state: TracksCacheState, action: AddSuccededAction<Track>) {
    const { entries } = action

    const newPermalinks = zipObject(
      entries.map((track) => track.metadata.permalink.toLowerCase()),
      entries.map((track) => track.metadata.track_id)
    )

    return { ...state, permalinks: { ...state.permalinks, ...newPermalinks } }
  }
}

const reducer = (state = initialState, action: AddSuccededAction<Track>) => {
  const matchingReduceFunction = actionsMap[action.type]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}

export default reducer
