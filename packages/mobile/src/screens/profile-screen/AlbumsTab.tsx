import { useEffect } from 'react'

import {
  cacheUsersActions,
  profilePageActions,
  profilePageSelectors
} from '@audius/common'
import { useIsFocused } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'

import { CollectionList } from 'app/components/collection-list/CollectionList'

import { EmptyProfileTile } from './EmptyProfileTile'
import { useSelectProfile } from './selectors'
const { getProfileAlbums, getFetchedCollections } = profilePageSelectors
const { fetchUserCollections } = cacheUsersActions
const { setFetchedCollections } = profilePageActions

export const AlbumsTab = () => {
  const { user_id, handle, album_count } = useSelectProfile([
    'user_id',
    'handle',
    'album_count'
  ])
  const albums = useSelector((state) => getProfileAlbums(state, handle))
  const fetchedCollections = useSelector((state) =>
    getFetchedCollections(state, handle)
  )
  const isFocused = useIsFocused()
  const dispatch = useDispatch()

  useEffect(() => {
    if (isFocused && album_count > 0 && !fetchedCollections) {
      dispatch(setFetchedCollections(handle))
      dispatch(fetchUserCollections(user_id))
    }
  }, [isFocused, album_count, fetchedCollections, dispatch, handle, user_id])

  return (
    <CollectionList
      listKey='profile-albums'
      collection={album_count === 0 ? [] : albums}
      ListEmptyComponent={<EmptyProfileTile tab='albums' />}
      disableTopTabScroll
      showsVerticalScrollIndicator={false}
    />
  )
}
