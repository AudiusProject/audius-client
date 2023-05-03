import { useCallback, useEffect, useState } from 'react'

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
  getAlbumsWithDetails,
  getAccountPlaylists
} = savedCollectionsSelectors

const PAGE_SIZE = 10

export function useSavedAlbums() {
  return useSelector(getAccountAlbums)
}

/* TODO: Handle filtering
 * Option 1: This hook takes the list of album ids to fetch and computes the unfetched
 * based on that.
 * Option 2: Bake filter into selectors which drive this. Downside: Can't use this in multiple places...
 */
export function useSavedAlbumsDetails() {
  const dispatch = useDispatch()
  const [hasFetched, setHasFetched] = useState(false)
  const { unfetched: unfetchedAlbums, fetched: albumsWithDetails } =
    useSelector(getAlbumsWithDetails)
  const { status } = useSelector(getSavedAlbumsState)

  const fetchMore = useCallback(() => {
    if (status === Status.LOADING || unfetchedAlbums.length === 0) {
      return
    }
    const ids = unfetchedAlbums
      .slice(0, Math.min(PAGE_SIZE, unfetchedAlbums.length))
      .map((c) => c.id)
    dispatch(fetchCollections({ type: 'albums', ids }))
    setHasFetched(true)
  }, [status, unfetchedAlbums, dispatch, setHasFetched])

  // Fetch first page if we don't have any items fetched yet
  // Needs to wait for at least some albums to be fetchable
  useEffect(() => {
    if (
      !hasFetched &&
      status !== Status.LOADING &&
      unfetchedAlbums.length > 0 &&
      albumsWithDetails.length === 0
    ) {
      fetchMore()
    }
  }, [albumsWithDetails, status, hasFetched, unfetchedAlbums, fetchMore])

  return { data: albumsWithDetails, status, fetchMore }
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
