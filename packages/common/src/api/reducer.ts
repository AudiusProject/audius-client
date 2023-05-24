import { combineReducers } from 'redux'

import { collectionApiReducer } from './collection'
import { relatedArtistApiReducer } from './relatedArtists'
import { trackApiReducer } from './track'
import { userApiReducer } from './user'

export default combineReducers({
  collectionApiReducer,
  relatedArtistApiReducer,
  trackApiReducer,
  userApiReducer
})
