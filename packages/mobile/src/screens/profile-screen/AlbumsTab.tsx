import { useEffect } from 'react'

import {
  profilePageActions,
  profilePageSelectors,
  Status
} from '@audius/common'
import { useIsFocused } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'

import { CollectionList } from 'app/components/collection-list/CollectionList'

import { EmptyProfileTile } from './EmptyProfileTile'
import { useSelectProfile } from './selectors'
const { getProfileAlbums, getCollectionsStatus } = profilePageSelectors
const { fetchCollections } = profilePageActions

export const AlbumsTab = () => {
  const { handle, album_count } = useSelectProfile(['handle', 'album_count'])
  const albums = useSelector((state) => getProfileAlbums(state, handle))
  const collectionsStatus = useSelector((state) =>
    getCollectionsStatus(state, handle)
  )
  const isFocused = useIsFocused()
  const dispatch = useDispatch()

  useEffect(() => {
    if (isFocused && album_count > 0 && collectionsStatus === Status.IDLE) {
      dispatch(fetchCollections(handle))
    }
  }, [isFocused, album_count, collectionsStatus, dispatch, handle])

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
