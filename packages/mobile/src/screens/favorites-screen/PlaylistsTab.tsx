import { useCallback, useState } from 'react'

import type {
  Cacheable,
  Collection,
  CommonState,
  ID,
  User,
  UserCollection
} from '@audius/common'
import {
  accountActions,
  accountSelectors,
  useProxySelector
} from '@audius/common'
import { useFocusEffect } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { useEffectOnce } from 'react-use'

import { CollectionList } from 'app/components/collection-list'
import { VirtualizedScrollView, Button } from 'app/components/core'
import { useNavigation } from 'app/hooks/useNavigation'

import type { FavoritesTabScreenParamList } from '../app-screen/FavoritesTabScreen'

import { EmptyTab } from './EmptyTab'
import { FilterInput } from './FilterInput'

const { fetchSavedPlaylists } = accountActions

const messages = {
  emptyTabText: "You haven't favorited any playlists yet.",
  inputPlaceholder: 'Filter Playlists'
}

export const PlaylistsTab = () => {
  const navigation = useNavigation<FavoritesTabScreenParamList>()
  const [filterValue, setFilterValue] = useState('')

  const matchesFilter = (
    playlist: Collection,
    users: Record<ID, Cacheable<User>>
  ) => {
    const matchValue = filterValue.toLowerCase()
    const { playlist_name, playlist_owner_id } = playlist
    const playlistOwner = users[playlist_owner_id].metadata
    return (
      playlist_name.toLowerCase().indexOf(matchValue) > -1 ||
      playlistOwner.name.toLowerCase().indexOf(matchValue) > -1
    )
  }

  const userPlaylists = useProxySelector(
    (state: CommonState) => {
      const { userId } = state.account
      const collectionEntries = state.collections.entries
      const { collections } = state.account
      return Object.values(collections)
        .map((collection) => collectionEntries[collection.id]?.metadata)
        ?.filter(
          (playlist) =>
            playlist &&
            !playlist.is_album &&
            playlist.playlist_owner_id !== userId &&
            matchesFilter(playlist, state.users.entries)
        )
    },
    [matchesFilter]
  )
  const dispatch = useDispatch()

  const handleFetchSavedPlaylists = useCallback(() => {
    dispatch(fetchSavedPlaylists())
  }, [dispatch])

  useFocusEffect(handleFetchSavedPlaylists)

  const handleNavigateToNewPlaylist = useCallback(() => {
    navigation.push('CreatePlaylist')
  }, [navigation])

  return (
    <VirtualizedScrollView listKey='favorites-playlists-view'>
      {!userPlaylists?.length && !filterValue ? (
        <EmptyTab message={messages.emptyTabText} />
      ) : (
        <FilterInput
          value={filterValue}
          placeholder={messages.inputPlaceholder}
          onChangeText={setFilterValue}
        />
      )}
      <Button
        title='Create a New Playlist'
        variant='commonAlt'
        onPress={handleNavigateToNewPlaylist}
      />
      <CollectionList
        listKey='favorites-playlists'
        scrollEnabled={false}
        collection={(userPlaylists as UserCollection[]) ?? []}
      />
    </VirtualizedScrollView>
  )
}
