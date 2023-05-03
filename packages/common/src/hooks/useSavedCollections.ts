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
  getAlbumsWithDetails,
  getAccountPlaylists
} = savedCollectionsSelectors
const PAGE_SIZE = 10

export function useSavedAlbums() {
  return useSelector(getAccountAlbums)
}

export function useSavedAlbumsDetails() {
  const dispatch = useDispatch()
  const { unfetched: unfetchedAlbums, fetched: albumsWithDetails } =
    useSelector(getAlbumsWithDetails)
  const albumsDetails = useSelector(getSavedAlbumsState)

  const fetchMore = useCallback(() => {
    if (
      albumsDetails.status === Status.LOADING ||
      unfetchedAlbums.length === 0
    ) {
      return
    }
    const ids = unfetchedAlbums
      .slice(0, Math.min(PAGE_SIZE, unfetchedAlbums.length))
      .map((c) => c.id)
    dispatch(fetchCollections({ type: 'albums', ids }))
  }, [albumsDetails.status, unfetchedAlbums, dispatch])

  return { albumsWithDetails, fetchMore }
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
