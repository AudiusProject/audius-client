import { getUsers } from 'store/cache/users/selectors'
import { getCollections } from 'store/cache/collections/selectors'
import { createShallowSelector } from 'utils/selectorHelpers'
import { createSelector } from 'reselect'

// Search Results selectors
export const getSearchTracksLineup = state => state.search.tracks
export const getSearchResults = state => state.search
export const getSearchStatus = state => state.search.status
export const getSearchResultsPageTracks = state => state.search.trackIds || []

const getSearchArtistsIds = state => state.search.artistIds || []
const getUnsortedSearchArtists = createShallowSelector(
  [getSearchArtistsIds, state => state],
  (artistIds, state) => getUsers(state, { ids: artistIds })
)
export const makeGetSearchArtists = () => {
  return createSelector(
    [getSearchArtistsIds, getUnsortedSearchArtists],
    (ids, artists) => ids.map(id => artists[id])
  )
}

const getSearchAlbums = state =>
  getCollections(state, { ids: state.search.albumIds })
export const makeGetSearchAlbums = () => {
  return createShallowSelector([getSearchAlbums, getUsers], (albums, users) =>
    Object.values(albums)
      .map(album => {
        return {
          ...album,
          user: users[album.playlist_owner_id]
        }
      })
      .filter(album => !!album.user)
  )
}

const getSearchPlaylists = state =>
  getCollections(state, { ids: state.search.playlistIds })
export const makeGetSearchPlaylists = () => {
  return createShallowSelector(
    [getSearchPlaylists, getUsers],
    (playlists, users) =>
      Object.values(playlists)
        .map(playlist => {
          return {
            ...playlist,
            user: users[playlist.playlist_owner_id],
            trackCount: (playlist.playlist_contents.track_ids || []).length
          }
        })
        .filter(playlist => !!playlist.user)
  )
}
