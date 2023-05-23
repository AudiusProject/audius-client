import { combineReducers } from 'redux'

import audioTransactionApi from './audio-transaction/audioTransaction'
import collectionApi from './collection'
import relatedArtistsApi from './relatedArtists'
import trackApi from './track'
import userApi from './user'

export default combineReducers({
  audioTransactionApi,
  relatedArtistsApi,
  trackApi,
  collectionApi,
  userApi
})
