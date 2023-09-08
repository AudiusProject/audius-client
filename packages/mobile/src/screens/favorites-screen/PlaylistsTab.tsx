import { useCallback, useState } from 'react'

import type { CommonState } from '@audius/common'
import {
  SavedPageTabs,
  CreatePlaylistSource,
  FeatureFlags,
  LibraryCategory,
  reachabilitySelectors,
  statusIsNotFinalized,
  savedPageSelectors
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
import { useCollectionsScreenData } from './useCollectionsScreenData'

const { getIsReachable } = reachabilitySelectors
const { getCategory } = savedPageSelectors

const messages = {
  emptyPlaylistFavoritesText: "You haven't favorited any playlists yet.",
  emptyPlaylistRepostsText: "You haven't reposted any playlists yet.",
  emptyPlaylistAllText:
    "You haven't favorited, reposted, or purchased any playlists yet.",
  inputPlaceholder: 'Filter Playlists'
}

export const PlaylistsTab = () => {
  const navigation = useNavigation<FavoritesTabScreenParamList>()
  const handleNavigateToNewPlaylist = useCallback(() => {
    navigation.push('CreatePlaylist')
  }, [navigation])
  const { isEnabled: isPlaylistUpdatesEnabled } = useFeatureFlag(
    FeatureFlags.PLAYLIST_UPDATES_POST_QA
  )
  const [filterValue, setFilterValue] = useState('')
  const {
    collectionIds: userPlaylists,
    hasMore,
    fetchMore,
    status
  } = useCollectionsScreenData({
    filterValue,
    collectionType: 'playlists'
  })
  const isReachable = useSelector(getIsReachable)

  const handleEndReached = useCallback(() => {
    if (isReachable && hasMore) {
      fetchMore()
    }
  }, [isReachable, hasMore, fetchMore])

  const loadingSpinner = <LoadingMoreSpinner />
  const noItemsLoaded =
    !statusIsNotFinalized(status) && !userPlaylists?.length && !filterValue

  const emptyTabText = useSelector((state: CommonState) => {
    const selectedCategory = getCategory(state, {
      currentTab: SavedPageTabs.PLAYLISTS
    })
    if (selectedCategory === LibraryCategory.All) {
      return messages.emptyPlaylistAllText
    } else if (selectedCategory === LibraryCategory.Favorite) {
      return messages.emptyPlaylistFavoritesText
    } else {
      return messages.emptyPlaylistRepostsText
    }
  })

  return (
    <VirtualizedScrollView>
      {noItemsLoaded ? (
        !isReachable ? (
          <NoTracksPlaceholder />
        ) : (
          <EmptyTileCTA message={emptyTabText} />
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
              collectionIds={userPlaylists}
              ListFooterComponent={
                statusIsNotFinalized(status) && isReachable
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
