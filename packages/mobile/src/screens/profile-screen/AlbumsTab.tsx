import {
  cacheUsersActions,
  profilePageActions,
  profilePageSelectors,
  Status
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { CollectionList } from 'app/components/collection-list/CollectionList'

import { EmptyProfileTile } from './EmptyProfileTile'
import { useSelectProfile } from './selectors'
import { useEffect } from 'react'
import { useIsFocused } from '@react-navigation/native'
const { getProfileAlbums, getCollectionsStatus } = profilePageSelectors
const { fetchUserCollections } = cacheUsersActions
const { fetchCollectionsSucceded } = profilePageActions

export const AlbumsTab = () => {
  const { user_id, handle, album_count } = useSelectProfile([
    'user_id',
    'handle',
    'album_count'
  ])
  const albums = useSelector((state) => getProfileAlbums(state, handle))
  const collectionsStatus = useSelector((state) =>
    getCollectionsStatus(state, handle)
  )
  const isFocused = useIsFocused()
  const dispatch = useDispatch()

  useEffect(() => {
    if (isFocused && album_count > 0 && collectionsStatus === Status.IDLE) {
      dispatch(fetchUserCollections(user_id))
      dispatch(fetchCollectionsSucceded(handle))
    }
  }, [isFocused, album_count, collectionsStatus, dispatch, handle, user_id])

  return (
    <CollectionList
      listKey='profile-albums'
      collection={albums}
      ListEmptyComponent={<EmptyProfileTile tab='albums' />}
      disableTopTabScroll
      showsVerticalScrollIndicator={false}
    />
  )
}
