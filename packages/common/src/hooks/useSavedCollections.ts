import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { accountActions } from '../store/account'
import { savedSelectors } from '../store/saved'

const { fetchSavedPlaylists, fetchSavedAlbums } = accountActions

export function useSavedAlbums() {
  return useSelector(savedSelectors.getAccountAlbums)
}

export function useSavedAlbumsDetails() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchSavedAlbums())
  }, [dispatch])
}

export function useSavedPlaylists() {
  return useSelector(savedSelectors.getAccountPlaylists)
}

export function useSavedPlaylistsDetails() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchSavedPlaylists())
  }, [dispatch])
}
