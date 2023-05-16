import { combineReducers } from 'redux'

import relatedArtistsApi from './relatedArtists'
import trackApi from './track'
import collectionApi from './collection'
import userApi from './user'

export default combineReducers({
  relatedArtistsApi,
  trackApi,
  collectionApi,
  userApi
})
