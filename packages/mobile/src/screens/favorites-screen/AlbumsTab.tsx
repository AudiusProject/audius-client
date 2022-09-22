import { useCallback, useState } from 'react'

import type {
  Cacheable,
  Collection,
  CommonState,
  ID,
  User,
  UserCollection
} from '@audius/common'
import { accountActions, useProxySelector } from '@audius/common'
import { useDispatch } from 'react-redux'
import { useEffectOnce } from 'react-use'

import { CollectionList } from 'app/components/collection-list'
import { VirtualizedScrollView } from 'app/components/core'

import { EmptyTab } from './EmptyTab'
import { FilterInput } from './FilterInput'

const { fetchSavedAlbums } = accountActions

const messages = {
  emptyTabText: "You haven't favorited any albums yet.",
  inputPlaceholder: 'Filter Albums'
}

export const AlbumsTab = () => {
  const dispatch = useDispatch()

  useEffectOnce(() => {
    dispatch(fetchSavedAlbums())
  })

  const [filterValue, setFilterValue] = useState('')

  const matchesFilter = useCallback(
    (playlist: Collection, users: Record<ID, Cacheable<User>>) => {
      const matchValue = filterValue.toLowerCase()
      const { playlist_name, playlist_owner_id } = playlist
      const playlistOwner = users[playlist_owner_id].metadata

      return (
        playlist_name.toLowerCase().indexOf(matchValue) > -1 ||
        playlistOwner.name.toLowerCase().indexOf(matchValue) > -1
      )
    },
    [filterValue]
  )

  const userAlbums = useProxySelector(
    (state: CommonState) => {
      const { userId } = state.account
      const collectionEntries = state.collections.entries
      const { collections } = state.account
      return Object.values(collections)
        .map((collection) => collectionEntries[collection.id]?.metadata)
        ?.filter(
          (playlist) =>
            playlist &&
            playlist.is_album &&
            playlist.playlist_owner_id !== userId &&
            matchesFilter(playlist, state.users.entries)
        )
    },
    [matchesFilter]
  )

  return (
    <VirtualizedScrollView listKey='favorites-albums-view'>
      {!userAlbums?.length && !filterValue ? (
        <EmptyTab message={messages.emptyTabText} />
      ) : (
        <>
          <FilterInput
            value={filterValue}
            placeholder={messages.inputPlaceholder}
            onChangeText={setFilterValue}
          />
          <CollectionList
            listKey='favorites-albums'
            scrollEnabled={false}
            collection={(userAlbums as UserCollection[]) ?? []}
            style={{ marginVertical: 12 }}
          />
        </>
      )}
    </VirtualizedScrollView>
  )
}
