import { useCallback, useMemo } from 'react'

import {
  SquareSizes,
  encodeUrlName,
  removeNullable,
  FavoriteSource,
  RepostSource,
  ShareSource,
  FavoriteType,
  collectionPageActions,
  collectionPageSuggestedLineupActions as suggestedTracksActions,
  formatDate,
  accountSelectors,
  collectionPageSelectors,
  collectionsSocialActions,
  OverflowAction,
  OverflowSource,
  publishPlaylistConfirmationModalUIActions,
  mobileOverflowMenuUIActions,
  shareModalUIActions,
  RepostType,
  repostsUserListActions,
  favoritesUserListActions,
  createPlaylistModalUIActions,
  Status
} from '@audius/common'
import type {
  Collection,
  Nullable,
  User,
  SearchPlaylist,
  SearchUser,
  CommonState
} from '@audius/common'
import { useFocusEffect } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'

import {
  Text,
  ScreenContent,
  Screen,
  VirtualizedScrollView,
  Button
} from 'app/components/core'
import { CollectionImage } from 'app/components/image/CollectionImage'
import type { ImageProps } from 'app/components/image/FastImage'
import { TrackList } from 'app/components/track-list'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useNavigation } from 'app/hooks/useNavigation'
import { useRoute } from 'app/hooks/useRoute'
import { setVisibility } from 'app/store/drawers/slice'
import { getIsCollectionMarkedForDownload } from 'app/store/offline-downloads/selectors'
import { makeStyles } from 'app/styles'

import { CollectionScreenDetailsTile } from './CollectionScreenDetailsTile'
import { CollectionScreenSkeleton } from './CollectionScreenSkeleton'

const { open: openEditPlaylist } = createPlaylistModalUIActions
const { setFavorite } = favoritesUserListActions
const { setRepost } = repostsUserListActions
const { requestOpen: requestOpenShareModal } = shareModalUIActions
const { open: openOverflowMenu } = mobileOverflowMenuUIActions
const {
  repostCollection,
  saveCollection,
  undoRepostCollection,
  unsaveCollection
} = collectionsSocialActions
const { fetchCollection } = collectionPageActions
const { getCollection, getUser, getCollectionSuggestedTracksLineup } =
  collectionPageSelectors
const getUserId = accountSelectors.getUserId
const { requestOpen: openPublishConfirmation } =
  publishPlaylistConfirmationModalUIActions

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    padding: spacing(3)
  }
}))

/**
 * `CollectionScreen` displays the details of a collection
 */
export const CollectionScreen = () => {
  const { params } = useRoute<'Collection'>()
  const dispatch = useDispatch()

  // params is incorrectly typed and can sometimes be undefined
  const {
    id: idParam,
    searchCollection,
    collectionName,
    collectionType
  } = params ?? {}

  const id = useMemo(() => {
    if (collectionName) {
      // Use collectionName from params if provided
      // This is to support deep linking
      // TODO: update this when collections are updated to use slug url format
      // https://linear.app/audius/issue/C-1198/update-mobile-deep-linking-to-support-collection-slug-url-format
      const nameParts = collectionName.split('-')
      const collectionId = parseInt(nameParts[nameParts.length - 1], 10)
      return collectionId as number
    }
    return idParam as number
  }, [collectionName, idParam])

  const handleFetchCollection = useCallback(() => {
    dispatch(fetchCollection(id))
  }, [dispatch, id])

  useFocusEffect(handleFetchCollection)

  const cachedCollection = useSelector((state) =>
    getCollection(state, { id })
  ) as Nullable<Collection>

  const cachedUser = useSelector((state) =>
    getUser(state, { id: cachedCollection?.playlist_owner_id })
  )

  const collection = cachedCollection ?? searchCollection
  const user = cachedUser ?? searchCollection?.user

  return !collection || !user ? (
    <CollectionScreenSkeleton collectionType={collectionType} />
  ) : (
    <CollectionScreenComponent collection={collection} user={user} />
  )
}

const selectIsLineupLoading = (state: CommonState) => {
  return getCollectionSuggestedTracksLineup(state).status === Status.LOADING
}

const selectSuggestedLineupEntries = (state: CommonState) =>
  getCollectionSuggestedTracksLineup(state).entries

type CollectionScreenComponentProps = {
  collection: Collection | SearchPlaylist
  user: User | SearchUser
}
const CollectionScreenComponent = (props: CollectionScreenComponentProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const { collection, user } = props
  const {
    _is_publishing,
    description,
    playlist_contents: { track_ids },
    has_current_user_reposted,
    has_current_user_saved,
    is_album,
    is_private,
    playlist_id,
    playlist_name,
    playlist_owner_id,
    repost_count,
    save_count,
    updated_at
  } = collection
  const isOfflineModeEnabled = useIsOfflineModeEnabled()
  const isLineupLoading = useSelector(selectIsLineupLoading)
  const suggestedLineupEntries = useSelector(selectSuggestedLineupEntries)

  const url = useMemo(() => {
    return `/${encodeUrlName(user.handle)}/${
      is_album ? 'album' : 'playlist'
    }/${encodeUrlName(playlist_name)}-${playlist_id}`
  }, [user.handle, is_album, playlist_name, playlist_id])

  const renderImage = useCallback(
    (props: ImageProps) => (
      <CollectionImage
        collection={collection}
        size={SquareSizes.SIZE_480_BY_480}
        {...props}
      />
    ),
    [collection]
  )

  const currentUserId = useSelector(getUserId)
  const isOwner = currentUserId === playlist_owner_id
  const extraDetails = useMemo(
    () => [
      {
        label: 'Modified',
        value: formatDate(updated_at || Date.now())
      }
    ],
    [updated_at]
  )

  const isCollectionMarkedForDownload = useSelector(
    getIsCollectionMarkedForDownload(playlist_id.toString())
  )

  const handlePressOverflow = useCallback(() => {
    const overflowActions = [
      !is_album && isOwner ? OverflowAction.EDIT_PLAYLIST : null,
      isOwner && !is_album && is_private
        ? OverflowAction.PUBLISH_PLAYLIST
        : null,
      isOwner && !is_album ? OverflowAction.DELETE_PLAYLIST : null,
      OverflowAction.VIEW_ARTIST_PAGE
    ].filter(removeNullable)

    dispatch(
      openOverflowMenu({
        source: OverflowSource.COLLECTIONS,
        id: playlist_id,
        overflowActions
      })
    )
  }, [dispatch, playlist_id, isOwner, is_album, is_private])

  const handlePressEdit = useCallback(() => {
    navigation?.push('EditPlaylist', { id: playlist_id })
    dispatch(openEditPlaylist(playlist_id))
  }, [dispatch, navigation, playlist_id])

  const handlePressPublish = useCallback(() => {
    dispatch(openPublishConfirmation({ playlistId: playlist_id }))
  }, [dispatch, playlist_id])

  const handlePressSave = useCallback(() => {
    if (has_current_user_saved) {
      if (isCollectionMarkedForDownload) {
        dispatch(
          setVisibility({
            drawer: 'UnfavoriteDownloadedCollection',
            visible: true,
            data: { collectionId: playlist_id }
          })
        )
      } else {
        dispatch(unsaveCollection(playlist_id, FavoriteSource.COLLECTION_PAGE))
      }
    } else {
      dispatch(saveCollection(playlist_id, FavoriteSource.COLLECTION_PAGE))
    }
  }, [
    dispatch,
    playlist_id,
    has_current_user_saved,
    isCollectionMarkedForDownload
  ])

  const handlePressShare = useCallback(() => {
    dispatch(
      requestOpenShareModal({
        type: 'collection',
        collectionId: playlist_id,
        source: ShareSource.PAGE
      })
    )
  }, [dispatch, playlist_id])

  const handlePressRepost = useCallback(() => {
    if (has_current_user_reposted) {
      dispatch(undoRepostCollection(playlist_id, RepostSource.COLLECTION_PAGE))
    } else {
      dispatch(repostCollection(playlist_id, RepostSource.COLLECTION_PAGE))
    }
  }, [dispatch, playlist_id, has_current_user_reposted])

  const handlePressFavorites = useCallback(() => {
    dispatch(setFavorite(playlist_id, FavoriteType.PLAYLIST))
    navigation.push('Favorited', {
      id: playlist_id,
      favoriteType: FavoriteType.PLAYLIST
    })
  }, [dispatch, playlist_id, navigation])

  const handlePressReposts = useCallback(() => {
    dispatch(setRepost(playlist_id, RepostType.COLLECTION))
    navigation.push('Reposts', {
      id: playlist_id,
      repostType: RepostType.COLLECTION
    })
  }, [dispatch, playlist_id, navigation])

  const handleRefreshSuggestions = useCallback(() => {
    dispatch(suggestedTracksActions.fetchLineupMetadatas())
  }, [dispatch])

  return (
    <Screen url={url}>
      <ScreenContent isOfflineCapable={isOfflineModeEnabled}>
        <VirtualizedScrollView style={styles.root}>
          <CollectionScreenDetailsTile
            description={description ?? ''}
            extraDetails={extraDetails}
            hasReposted={has_current_user_reposted}
            hasSaved={has_current_user_saved}
            isAlbum={is_album}
            collectionId={playlist_id}
            isPrivate={is_private}
            isPublishing={_is_publishing ?? false}
            onPressEdit={handlePressEdit}
            onPressFavorites={handlePressFavorites}
            onPressOverflow={handlePressOverflow}
            onPressPublish={handlePressPublish}
            onPressRepost={handlePressRepost}
            onPressReposts={handlePressReposts}
            onPressSave={handlePressSave}
            onPressShare={handlePressShare}
            renderImage={renderImage}
            repostCount={repost_count}
            saveCount={save_count}
            trackCount={track_ids.length}
            title={playlist_name}
            user={user}
          />
          {/* TODO: KJ - Placeholder. Need to update this to be the new suggested tracks UI */}
          <TrackList
            showDivider
            showSkeleton={isLineupLoading}
            style={{ marginVertical: 24 }}
            ListHeaderComponent={
              <Text
                style={{ marginBottom: 12 }}
                fontSize='large'
                weight='heavy'
              >
                Suggested Tracks
              </Text>
            }
            uids={
              isLineupLoading
                ? Array(5)
                : suggestedLineupEntries.map((entry) => entry.uid)
            }
            ListEmptyComponent={<Text>No Tracks Dude</Text>}
          />
          <Button
            title='Refresh Suggestions'
            onPress={handleRefreshSuggestions}
            style={{ marginBottom: 48 }}
          />
        </VirtualizedScrollView>
      </ScreenContent>
    </Screen>
  )
}
