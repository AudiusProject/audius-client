import { useCallback, useMemo, useState } from 'react'

import {
  useProxySelector,
  reachabilitySelectors,
  shallowCompare
} from '@audius/common'
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import { useSelector } from 'react-redux'

import { CollectionList } from 'app/components/collection-list'
import { VirtualizedScrollView, Button } from 'app/components/core'
import { EmptyTileCTA } from 'app/components/empty-tile-cta'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useNavigation } from 'app/hooks/useNavigation'
import type { AppState } from 'app/store'
import {
  getIsDoneLoadingFromDisk,
  getOfflineCollectionsStatus,
  getOfflineTrackStatus
} from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'

import type { FavoritesTabScreenParamList } from '../app-screen/FavoritesTabScreen'

import { FilterInput } from './FilterInput'
import { NoTracksPlaceholder } from './NoTracksPlaceholder'
import { OfflineContentBanner } from './OfflineContentBanner'
import { getAccountCollections } from './selectors'
import { buildCollectionIdsToNumPlayableTracksMap } from './utils'

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
  const isDoneLoadingFromDisk = useSelector(getIsDoneLoadingFromDisk)
  const offlineTracksStatus = useProxySelector(
    (state: AppState) => {
      if (isDoneLoadingFromDisk && isOfflineModeEnabled && !isReachable) {
        return getOfflineTrackStatus(state)
      }
      // We don't need offline download status when we're not offline. This saves us rerenders while we're downloading things and updating the offline download slice.
      return undefined
    },
    [isReachable, isOfflineModeEnabled, isDoneLoadingFromDisk]
  )

  const userPlaylists = useProxySelector(
    (state: AppState) => {
      if (isOfflineModeEnabled && !isReachable) {
        if (!isDoneLoadingFromDisk) {
          return []
        }
      }
      const offlineCollectionsStatus = getOfflineCollectionsStatus(state)
      return getAccountCollections(state, filterValue).filter((collection) => {
        if (collection.is_album) {
          return false
        }
        if (isOfflineModeEnabled && !isReachable) {
          const trackIds =
            collection.playlist_contents.track_ids.map(
              (trackData) => trackData.track
            ) ?? []
          const collectionDownloadStatus =
            offlineCollectionsStatus[collection.playlist_id]
          // Don't show a playlist in Offline Mode if it has at least one track but none of the tracks have been downloaded yet OR if it is not marked for download
          return (
            !collection.is_album &&
            Boolean(collectionDownloadStatus) &&
            collectionDownloadStatus !== OfflineDownloadStatus.INACTIVE &&
            (trackIds.length === 0 ||
              trackIds.some((t) => {
                return (
                  offlineTracksStatus &&
                  offlineTracksStatus[t.toString()] ===
                    OfflineDownloadStatus.SUCCESS
                )
              }))
          )
        }
        return true
      })
    },
    [
      filterValue,
      isReachable,
      isOfflineModeEnabled,
      isDoneLoadingFromDisk,
      offlineTracksStatus
    ],
    shallowCompare
  )

  const numPlayableTracksMap = useMemo(() => {
    return buildCollectionIdsToNumPlayableTracksMap(
      userPlaylists,
      isOfflineModeEnabled && !isReachable,
      offlineTracksStatus || {}
    )
  }, [isOfflineModeEnabled, isReachable, offlineTracksStatus, userPlaylists])

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
          {!isReachable && isOfflineModeEnabled ? null : (
            <Animated.View layout={Layout} entering={FadeIn} exiting={FadeOut}>
              <Button
                title='Create a New Playlist'
                variant='commonAlt'
                onPress={handleNavigateToNewPlaylist}
              />
            </Animated.View>
          )}

          <Animated.View layout={Layout}>
            <CollectionList
              listKey='favorites-playlists'
              scrollEnabled={false}
              collection={userPlaylists}
              collectionIdsToNumTracks={numPlayableTracksMap}
            />
          </Animated.View>
        </>
      )}
    </VirtualizedScrollView>
  )
}
