import { useEffect } from 'react'

import {
  cacheUsersActions,
  profilePageActions,
  profilePageSelectors
} from '@audius/common'
import { useIsFocused } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'

import { CollectionList } from 'app/components/collection-list'

import { EmptyProfileTile } from './EmptyProfileTile'
import { useSelectProfile } from './selectors'
const { fetchUserCollections } = cacheUsersActions
const { getProfilePlaylists, getFetchedCollections } = profilePageSelectors
const { setFetchedCollections } = profilePageActions

export const PlaylistsTab = () => {
  const { user_id, handle, playlist_count } = useSelectProfile([
    'user_id',
    'handle',
    'playlist_count'
  ])
  console.log('playlist count?', playlist_count)
  const playlists = useSelector((state) => getProfilePlaylists(state, handle))
  const fetchedCollections = useSelector((state) =>
    getFetchedCollections(state, handle)
  )
  console.log('playlists', playlists)
  const isFocused = useIsFocused()
  const dispatch = useDispatch()

  console.log('fetched collections playlists?', fetchedCollections, isFocused)

  useEffect(() => {
    if (isFocused && playlist_count > 0 && !fetchedCollections) {
      console.log('this should not hit')
      dispatch(setFetchedCollections(handle))
      dispatch(fetchUserCollections(user_id))
    }
  }, [isFocused, playlist_count, fetchedCollections, dispatch, handle, user_id])

  return (
    <CollectionList
      listKey='profile-playlists'
      collection={playlist_count === 0 ? [] : playlists}
      ListEmptyComponent={<EmptyProfileTile tab='playlists' />}
      disableTopTabScroll
      showsVerticalScrollIndicator={false}
    />
  )
}
