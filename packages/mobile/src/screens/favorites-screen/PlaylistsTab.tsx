import { useCallback, useState } from 'react'

import {
  CreatePlaylistSource,
  FeatureFlags,
  reachabilitySelectors,
  statusIsNotFinalized,
  useAllPaginatedQuery,
  accountSelectors,
  useGetLibraryPlaylists
} from '@audius/common'
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import { useSelector } from 'react-redux'

import { CollectionList } from 'app/components/collection-list'
import { Button, VirtualizedScrollView } from 'app/components/core'
import { EmptyTileCTA } from 'app/components/empty-tile-cta'
import { useNavigation } from 'app/hooks/useNavigation'
import { useFeatureFlag } from 'app/hooks/useRemoteConfig'
import { spacing } from 'app/styles/spacing'

import type { FavoritesTabScreenParamList } from '../app-screen/FavoritesTabScreen'

import { FilterInput } from './FilterInput'
import { LoadingMoreSpinner } from './LoadingMoreSpinner'
import { NoTracksPlaceholder } from './NoTracksPlaceholder'
import { OfflineContentBanner } from './OfflineContentBanner'

const { getUserId } = accountSelectors
const { getIsReachable } = reachabilitySelectors

const messages = {
  emptyTabText: "You haven't favorited any playlists yet.",
  inputPlaceholder: 'Filter Playlists'
}

export const PlaylistsTab = () => {
  const navigation = useNavigation<FavoritesTabScreenParamList>()
  const currentUserId = useSelector(getUserId)
  const handleNavigateToNewPlaylist = useCallback(() => {
    navigation.push('CreatePlaylist')
  }, [navigation])
  const { isEnabled: isPlaylistUpdatesEnabled } = useFeatureFlag(
    FeatureFlags.PLAYLIST_UPDATES_POST_QA
  )

  const isReachable = useSelector(getIsReachable)
  const [filterValue, setFilterValue] = useState('')
  const {
    data: fetchedPlaylists,
    status,
    hasMore,
    loadMore: fetchMore
  } = useAllPaginatedQuery(
    useGetLibraryPlaylists,
    {
      userId: currentUserId!
    },
    {
      pageSize: 20,
      disabled: currentUserId == null || !isReachable
    }
  )
  const playlistIds = fetchedPlaylists?.map((p) => p.playlist_id)

  const handleEndReached = useCallback(() => {
    if (isReachable && hasMore) {
      fetchMore()
    }
  }, [isReachable, hasMore, fetchMore])

  const loadingSpinner = <LoadingMoreSpinner />
  const noItemsLoaded =
    !statusIsNotFinalized(status) && !fetchedPlaylists.length && !filterValue

  return (
    <VirtualizedScrollView>
      {noItemsLoaded ? (
        !isReachable ? (
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
          {!isReachable || isPlaylistUpdatesEnabled ? null : (
            <Animated.View layout={Layout} entering={FadeIn} exiting={FadeOut}>
              <Button
                title='Create a New Playlist'
                variant='commonAlt'
                onPress={handleNavigateToNewPlaylist}
                style={{ marginBottom: spacing(4) }}
              />
            </Animated.View>
          )}
          <Animated.View layout={Layout}>
            <CollectionList
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              scrollEnabled={false}
              collectionIds={playlistIds}
              ListFooterComponent={
                (statusIsNotFinalized(status) || hasMore) && isReachable
                  ? loadingSpinner
                  : null
              }
              showCreatePlaylistTile={isPlaylistUpdatesEnabled && !!isReachable}
              createPlaylistSource={CreatePlaylistSource.LIBRARY_PAGE}
            />
          </Animated.View>
        </>
      )}
    </VirtualizedScrollView>
  )
}
