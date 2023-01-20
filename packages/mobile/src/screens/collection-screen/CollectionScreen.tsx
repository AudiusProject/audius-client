import { useCallback, useMemo } from 'react'

import type { Collection, Nullable, User } from '@audius/common'
import {
  encodeUrlName,
  removeNullable,
  FavoriteSource,
  RepostSource,
  ShareSource,
  FavoriteType,
  collectionPageActions,
  formatDate,
  accountSelectors,
  collectionPageSelectors,
  collectionsSocialActions,
  OverflowAction,
  OverflowSource,
  mobileOverflowMenuUIActions,
  shareModalUIActions,
  RepostType,
  repostsUserListActions,
  favoritesUserListActions
} from '@audius/common'
import { useFocusEffect } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'

import type { DynamicImageProps } from 'app/components/core'
import {
  ScreenContent,
  Screen,
  VirtualizedScrollView
} from 'app/components/core'
import { CollectionImage } from 'app/components/image/CollectionImage'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useNavigation } from 'app/hooks/useNavigation'
import { useRoute } from 'app/hooks/useRoute'
import { setVisibility } from 'app/store/drawers/slice'
import { getIsCollectionMarkedForDownload } from 'app/store/offline-downloads/selectors'
import type { SearchPlaylist, SearchUser } from 'app/store/search/types'
import { makeStyles } from 'app/styles'

import { CollectionScreenDetailsTile } from './CollectionScreenDetailsTile'
import { CollectionScreenSkeleton } from './CollectionScreenSkeleton'

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
const { getCollection, getUser } = collectionPageSelectors
const getUserId = accountSelectors.getUserId

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

  const url = useMemo(() => {
    return `/${encodeUrlName(user.handle)}/${
      is_album ? 'album' : 'playlist'
    }/${encodeUrlName(playlist_name)}-${playlist_id}`
  }, [user.handle, is_album, playlist_name, playlist_id])

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

  return (
    <Screen url={url}>
      <ScreenContent isOfflineCapable={isOfflineModeEnabled}>
        <VirtualizedScrollView
          listKey={`playlist-${collection.playlist_id}`}
          style={styles.root}
        >
          <CollectionScreenDetailsTile
            description={description ?? ''}
            extraDetails={extraDetails}
            hasReposted={has_current_user_reposted}
            hasSaved={has_current_user_saved}
            isAlbum={is_album}
            isPrivate={is_private}
            isPublishing={_is_publishing ?? false}
            onPressFavorites={handlePressFavorites}
            onPressOverflow={handlePressOverflow}
            onPressRepost={handlePressRepost}
            onPressReposts={handlePressReposts}
            onPressSave={handlePressSave}
            onPressShare={handlePressShare}
            repostCount={repost_count}
            saveCount={save_count}
            title={playlist_name}
            user={user}
          />
        </VirtualizedScrollView>
      </ScreenContent>
    </Screen>
  )
}
