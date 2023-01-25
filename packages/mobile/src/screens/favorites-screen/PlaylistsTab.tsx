import { useCallback, useState } from 'react'

import type { CommonState } from '@audius/common'
import { useProxySelector, reachabilitySelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import { CollectionList } from 'app/components/collection-list'
import { VirtualizedScrollView, Button } from 'app/components/core'
import { EmptyTileCTA } from 'app/components/empty-tile-cta'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useNavigation } from 'app/hooks/useNavigation'
import { getOfflineDownloadStatus } from 'app/store/offline-downloads/selectors'
import { OfflineTrackDownloadStatus } from 'app/store/offline-downloads/slice'

import type { FavoritesTabScreenParamList } from '../app-screen/FavoritesTabScreen'

import { FilterInput } from './FilterInput'
import { NoTracksPlaceholder } from './NoTracksPlaceholder'
import { OfflineContentBanner } from './OfflineContentBanner'
import { getAccountCollections } from './selectors'

const { getIsReachable } = reachabilitySelectors

const messages = {
  emptyTabText: "You haven't favorited any playlists yet.",
  inputPlaceholder: 'Filter Playlists'
}

export const PlaylistsTab = () => {
  const navigation = useNavigation<FavoritesTabScreenParamList>()
  const [filterValue, setFilterValue] = useState('')
  const isOfflineModeEnabled = useIsOfflineModeEnabled()
  const isReachable = useSelector(getIsReachable)
  const offlineDownloadStatus = useProxySelector(getOfflineDownloadStatus, [
    isReachable,
    isOfflineModeEnabled
  ])
  const userPlaylists = useProxySelector(
    (state: CommonState) =>
      getAccountCollections(state, filterValue).filter((collection) => {
        if (collection.is_album) {
          return false
        }
        if (isOfflineModeEnabled && !isReachable) {
          const trackIds =
            collection?.playlist_contents?.track_ids?.map(
              (trackData) => trackData.track
            ) ?? []

          // Don't show a playlist in Offline Mode if it has at least one track but none of the tracks have been downloaded yet
          console.log(offlineDownloadStatus)
          return (
            !collection.is_album &&
            (trackIds.length === 0 ||
              trackIds.some((t) => {
                return (
                  offlineDownloadStatus[t.toString()] ===
                  OfflineTrackDownloadStatus.SUCCESS
                )
              }))
          )
        }
        return true
      }),
    [filterValue, isReachable, isOfflineModeEnabled]
  )

  const handleNavigateToNewPlaylist = useCallback(() => {
    navigation.push('CreatePlaylist')
  }, [navigation])

  return (
    <VirtualizedScrollView listKey='favorites-playlists-view'>
      {!userPlaylists?.length && !filterValue ? (
        isOfflineModeEnabled && !isReachable ? (
          <NoTracksPlaceholder />
        ) : (
          <EmptyTileCTA message={messages.emptyTabText} />
        )
      ) : (
        <>
          <OfflineContentBanner />
          <FilterInput
            value={filterValue}
            placeholder={messages.inputPlaceholder}
            onChangeText={setFilterValue}
          />
          <>
            {!isReachable && isOfflineModeEnabled ? null : (
              <Button
                title='Create a New Playlist'
                variant='commonAlt'
                onPress={handleNavigateToNewPlaylist}
              />
            )}
          </>
          <CollectionList
            listKey='favorites-playlists'
            scrollEnabled={false}
            collection={userPlaylists}
          />
        </>
      )}
    </VirtualizedScrollView>
  )
}
