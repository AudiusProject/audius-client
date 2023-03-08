import {
  createEntityAdapter,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit'

import { ID } from 'models'

type RelatedArtists = { artistId: ID; relatedArtistIds: ID[] }

const relatedArtistsAdapater = createEntityAdapter<RelatedArtists>({
  selectId: (relatedArtists) => relatedArtists.artistId
})

const relatedArtistsSlice = createSlice({
  name: 'relatedArtists',
  initialState: relatedArtistsAdapater.getInitialState(),
  reducers: {
    fetchRelatedArtists: (
      _state,
      _action: PayloadAction<{ artistId: ID }>
    ) => {},
    fetchRelatedArtistsSucceeded: relatedArtistsAdapater.addOne
  }
})

export const { fetchRelatedArtists, fetchRelatedArtistsSucceeded } =
  relatedArtistsSlice.actions
export default relatedArtistsSlice.reducer
export const actions = relatedArtistsSlice.actions
