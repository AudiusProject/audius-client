import { createReducer } from '@reduxjs/toolkit'

import { ID } from 'models/common/Identifiers'
import { Status } from 'store/types'

import { fetchRelatedArtists, fetchRelatedArtistsSucceeded } from './actions'

type State = {
  relatedArtists: Record<ID, RelatedArtistStatus>
}

type RelatedArtistStatus = {
  status: Status
  relatedArtistIds: ID[]
}

const initialState: State = {
  relatedArtists: {}
}

const reducer = createReducer(initialState, builder =>
  builder
    .addCase(fetchRelatedArtists, (state, action) => {
      return {
        ...state,
        artistRecommendations: {
          ...state.relatedArtists,
          [action.payload.userId]: {
            relatedArtistIds: [],
            status: Status.LOADING
          }
        }
      }
    })
    .addCase(fetchRelatedArtistsSucceeded, (state, action) => {
      return {
        ...state,
        relatedArtists: {
          ...state.relatedArtists,
          [action.payload.userId]: {
            relatedArtistIds: action.payload.relatedArtistIds,
            status: Status.SUCCESS
          }
        }
      }
    })
)

export default reducer
