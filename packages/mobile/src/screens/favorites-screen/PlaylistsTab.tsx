import { useCallback, useState } from 'react'

import { reachabilitySelectors, statusIsNotFinalized } from '@audius/common'
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import { useSelector } from 'react-redux'

import { CollectionList } from 'app/components/collection-list'
import { Button, VirtualizedScrollView } from 'app/components/core'
import { EmptyTileCTA } from 'app/components/empty-tile-cta'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useNavigation } from 'app/hooks/useNavigation'

import type { FavoritesTabScreenParamList } from '../app-screen/FavoritesTabScreen'

import { FilterInput } from './FilterInput'
import { LoadingMoreSpinner } from './LoadingMoreSpinner'
import { NoTracksPlaceholder } from './NoTracksPlaceholder'
import { OfflineContentBanner } from './OfflineContentBanner'
import { useCollectionScreenData } from './useCollectionScreenData'

const { getIsReachable } = reachabilitySelectors

const messages = {
  emptyTabText: "You haven't favorited any playlists yet.",
  inputPlaceholder: 'Filter Playlists'
}

export const PlaylistsTab = () => {
  const navigation = useNavigation<FavoritesTabScreenParamList>()
  const handleNavigateToNewPlaylist = useCallback(() => {
    navigation.push('CreatePlaylist')
  }, [navigation])

  const [filterValue, setFilterValue] = useState('')
  const {
    collectionIds: userPlaylists,
    hasMore,
    fetchMore,
    status
  } = useCollectionScreenData({
    filterValue,
    collectionType: 'playlists'
  })
  const isOfflineModeEnabled = useIsOfflineModeEnabled()
  const isReachable = useSelector(getIsReachable)

  const handleEndReached = useCallback(() => {
    if (hasMore) {
      fetchMore()
    }
  }, [hasMore, fetchMore])

  const loadingSpinner = <LoadingMoreSpinner />

  return (
    <VirtualizedScrollView>
      {!statusIsNotFinalized(status) &&
      !userPlaylists?.length &&
      !filterValue ? (
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
              onEndReached={handleEndReached}
              onEndReachedThreshold={1}
              scrollEnabled={false}
              collectionIds={userPlaylists}
              ListFooterComponent={
                statusIsNotFinalized(status) ? loadingSpinner : null
              }
            />
          </Animated.View>
        </>
      )}
    </VirtualizedScrollView>
  )
}
