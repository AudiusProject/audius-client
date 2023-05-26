import { combineReducers } from 'redux'

import { audioTransactionApiReducer } from './audio-transaction'
import { collectionApiReducer } from './collection'
import { relatedArtistsApiReducer } from './relatedArtists'
import { trackApiReducer } from './track'
import { userApiReducer } from './user'

export default combineReducers({
  audioTransactionApi: audioTransactionApiReducer,
  collectionApi: collectionApiReducer,
  relatedArtistsApi: relatedArtistsApiReducer,
  trackApi: trackApiReducer,
  userApi: userApiReducer
})
