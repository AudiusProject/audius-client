import { uniq } from 'lodash'

import { CommonState } from 'store/commonStore'

import { ID } from '../../../models/Identifiers'

import { LibraryCategory, SavedPageTabs } from './types'

export const getSaved = (state: CommonState) => state.pages.savedPage
export const getTrackSaves = (state: CommonState) =>
  state.pages.savedPage.trackSaves

export const getCollectionsCategory = (state: CommonState) => {
  return state.pages.savedPage.collectionsCategory
}

export const getTracksCategory = (state: CommonState) => {
  return state.pages.savedPage.tracksCategory
}

export const getCategory = (
  state: CommonState,
  props: { currentTab: SavedPageTabs }
) => {
  if (props.currentTab === SavedPageTabs.TRACKS) {
    return getTracksCategory(state)
  } else {
    return getCollectionsCategory(state)
  }
}

export const getLocalTrackFavorites = (state: CommonState) =>
  state.pages.savedPage.local.track.favorites.added
export const getLocalTrackFavorite = (state: CommonState, props: { id: ID }) =>
  state.pages.savedPage.local.track.favorites.added[props.id]
export const getLocalTrackReposts = (state: CommonState) =>
  state.pages.savedPage.local.track.reposts.added
export const getLocalTrackRepost = (state: CommonState, props: { id: ID }) =>
  state.pages.savedPage.local.track.reposts.added[props.id]
export const getLocalTrackPurchases = (state: CommonState) =>
  state.pages.savedPage.local.track.purchased.added
export const getLocalTrackPurchase = (state: CommonState, props: { id: ID }) =>
  state.pages.savedPage.local.track.purchased.added[props.id]

export const getLocalAlbumFavorites = (state: CommonState) =>
  state.pages.savedPage.local.album.favorites.added
export const getLocalAlbumReposts = (state: CommonState) =>
  state.pages.savedPage.local.album.reposts.added
export const getLocalAlbumPurchases = (state: CommonState) =>
  state.pages.savedPage.local.album.purchased.added
export const getLocalRemovedAlbumFavorites = (state: CommonState) =>
  state.pages.savedPage.local.album.favorites.removed
export const getLocalRemovedAlbumReposts = (state: CommonState) =>
  state.pages.savedPage.local.album.reposts.removed

export const getLocalPlaylistFavorites = (state: CommonState) =>
  state.pages.savedPage.local.playlist.favorites.added
export const getLocalPlaylistReposts = (state: CommonState) =>
  state.pages.savedPage.local.playlist.reposts.added
export const getLocalRemovedPlaylistFavorites = (state: CommonState) =>
  state.pages.savedPage.local.playlist.favorites.removed
export const getLocalRemovedPlaylistReposts = (state: CommonState) =>
  state.pages.savedPage.local.playlist.favorites.removed

/** Get the tracks in currently selected category that have been added to the library in current session */
export const getSelectedCategoryLocalTrackAdds = (state: CommonState) => {
  const selectedCategory = getCategory(state, {
    currentTab: SavedPageTabs.TRACKS
  })
  const localFavorites = getLocalTrackFavorites(state)
  const localPurchases = getLocalTrackPurchases(state)
  const localReposts = getLocalTrackReposts(state)
  let localLibraryAdditions
  if (selectedCategory === LibraryCategory.Favorite) {
    localLibraryAdditions = localFavorites
  } else if (selectedCategory === LibraryCategory.Purchase) {
    localLibraryAdditions = localPurchases
  } else if (selectedCategory === LibraryCategory.Repost) {
    localLibraryAdditions = localReposts
  } else {
    // Category = ALL
    localLibraryAdditions = {
      ...localReposts,
      ...localFavorites,
      ...localPurchases
    }
  }

  return localLibraryAdditions
}

const getSelectedCategoryLocalCollectionUpdates = (
  state: CommonState,
  props: { collectionType: 'album' | 'playlist'; updateType: 'add' | 'remove' }
) => {
  const { collectionType, updateType } = props
  const currentTab =
    collectionType === 'album' ? SavedPageTabs.ALBUMS : SavedPageTabs.PLAYLISTS
  const selectedCategory = getCategory(state, { currentTab })
  let localFavorites: ID[], localPurchases: ID[], localReposts: ID[]
  if (updateType === 'add') {
    localFavorites =
      collectionType === 'album'
        ? getLocalAlbumFavorites(state)
        : getLocalPlaylistFavorites(state)
    localPurchases =
      collectionType === 'album' ? getLocalAlbumPurchases(state) : [] // Can't buy playlists
    localReposts =
      collectionType === 'album'
        ? getLocalAlbumReposts(state)
        : getLocalPlaylistReposts(state)
  } else {
    localFavorites =
      collectionType === 'album'
        ? getLocalRemovedAlbumFavorites(state)
        : getLocalRemovedPlaylistFavorites(state)
    localPurchases = [] // Can't remove purchases
    localReposts =
      collectionType === 'album'
        ? getLocalRemovedAlbumReposts(state)
        : getLocalRemovedPlaylistReposts(state)
  }

  switch (selectedCategory) {
    case LibraryCategory.Favorite:
      return localFavorites
    case LibraryCategory.Purchase:
      return localPurchases
    case LibraryCategory.Repost:
      return localReposts
    default:
      // Category = ALL
      return uniq([...localReposts, ...localFavorites, ...localPurchases])
  }
}

export const getSelectedCategoryLocalAlbumAdds = (state: CommonState) => {
  return getSelectedCategoryLocalCollectionUpdates(state, {
    collectionType: 'album',
    updateType: 'add'
  })
}
export const getSelectedCategoryLocalAlbumRemovals = (state: CommonState) => {
  return getSelectedCategoryLocalCollectionUpdates(state, {
    collectionType: 'album',
    updateType: 'remove'
  })
}
export const getSelectedCategoryLocalPlaylistRemovals = (
  state: CommonState
) => {
  return getSelectedCategoryLocalCollectionUpdates(state, {
    collectionType: 'playlist',
    updateType: 'remove'
  })
}
export const getSelectedCategoryLocalPlaylistAdds = (state: CommonState) => {
  return getSelectedCategoryLocalCollectionUpdates(state, {
    collectionType: 'playlist',
    updateType: 'add'
  })
}

export const getInitialFetchStatus = (state: CommonState) =>
  state.pages.savedPage.initialFetch
export const getIsFetchingMore = (state: CommonState) =>
  state.pages.savedPage.fetchingMore
export const hasReachedEnd = (state: CommonState) =>
  state.pages.savedPage.hasReachedEnd

export const getSavedTracksStatus = (state: CommonState) =>
  state.pages.savedPage.tracks.status
export const getSavedTracksLineup = (state: CommonState) =>
  state.pages.savedPage.tracks
export const getSavedTracksLineupUid = (
  state: CommonState,
  props: { id: ID }
) => {
  const track = state.pages.savedPage.tracks.entries.find(
    // @ts-ignore
    (t) => t.id === props.id
  )
  return track ? track.uid : null
}
