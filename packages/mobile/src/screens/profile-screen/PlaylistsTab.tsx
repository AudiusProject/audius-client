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
const { getProfilePlaylists, getCollectionsStatus } = profilePageSelectors
const { fetchUserCollections } = cacheUsersActions
const { fetchCollectionsSucceded } = profilePageActions

export const PlaylistsTab = () => {
  const { user_id, handle, playlist_count } = useSelectProfile([
    'user_id',
    'handle',
    'playlist_count'
  ])
  const playlists = useSelector((state) => getProfilePlaylists(state, handle))
  const collectionsStatus = useSelector((state) =>
    getCollectionsStatus(state, handle)
  )
  const isFocused = useIsFocused()
  const dispatch = useDispatch()

  useEffect(() => {
    if (isFocused && playlist_count > 0 && !collectionsStatus) {
      dispatch(fetchUserCollections(user_id))
      dispatch(fetchCollectionsSucceded(handle))
    }
  }, [isFocused, playlist_count, collectionsStatus, dispatch, handle, user_id])
  return (
    <CollectionList
      listKey='profile-playlists'
      collection={playlists}
      ListEmptyComponent={<EmptyProfileTile tab='playlists' />}
      disableTopTabScroll
      showsVerticalScrollIndicator={false}
    />
  )
}
