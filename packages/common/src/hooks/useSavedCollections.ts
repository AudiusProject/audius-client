import { useCallback, useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { Status } from 'models/Status'

import { accountActions } from '../store/account'
import {
  savedCollectionsActions,
  savedCollectionsSelectors
} from '../store/saved-collections'

const { fetchSavedPlaylists } = accountActions
const { fetchCollections } = savedCollectionsActions

const {
  getAccountAlbums,
  getSavedAlbumsState,
  getFetchedAlbumsWithDetails,
  getAccountPlaylists
} = savedCollectionsSelectors

const DEFAULT_PAGE_SIZE = 50

export function useSavedAlbums() {
  return useSelector(getAccountAlbums)
}

/* TODO: Handle filtering
 * Option 1: This hook takes the list of album ids to fetch and computes the unfetched
 * based on that.
 * Option 2: Bake filter into selectors which drive this. Downside: Can't use this in multiple places...
 */
type UseSavedAlbumDetailsConfig = {
  pageSize?: number
}
export function useSavedAlbumsDetails({
  pageSize = DEFAULT_PAGE_SIZE
}: UseSavedAlbumDetailsConfig) {
  const dispatch = useDispatch()

  const { unfetched: unfetchedAlbums, fetched: albumsWithDetails } =
    useSelector(getFetchedAlbumsWithDetails)
  const { status } = useSelector(getSavedAlbumsState)

  const fetchMore = useCallback(() => {
    if (status === Status.LOADING || unfetchedAlbums.length === 0) {
      return
    }
    const ids = unfetchedAlbums
      .slice(0, Math.min(pageSize, unfetchedAlbums.length))
      .map((c) => c.id)
    dispatch(fetchCollections({ type: 'albums', ids }))
  }, [status, unfetchedAlbums, pageSize, dispatch])

  return {
    data: albumsWithDetails,
    status,
    hasMore: unfetchedAlbums.length > 0,
    fetchMore
  }
}

export function useSavedPlaylists() {
  return useSelector(getAccountPlaylists)
}

export function useSavedPlaylistsDetails() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchSavedPlaylists())
  }, [dispatch])
}
