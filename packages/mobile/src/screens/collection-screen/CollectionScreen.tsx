import { useCallback, useEffect, useMemo } from 'react'

import type { Collection, User } from '@audius/common'
import {
  FavoriteSource,
  RepostSource,
  ShareSource,
  FavoriteType,
  SquareSizes,
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
import { useSelector } from 'common/hooks/useSelector'
import { useDispatch } from 'react-redux'
import { FAVORITING_USERS_ROUTE, REPOSTING_USERS_ROUTE } from 'utils/route'

import { Screen, VirtualizedScrollView } from 'app/components/core'
import { useCollectionCoverArt } from 'app/hooks/useCollectionCoverArt'
import { useNavigation } from 'app/hooks/useNavigation'
import { useRoute } from 'app/hooks/useRoute'
import type { SearchPlaylist, SearchUser } from 'app/store/search/types'
import { makeStyles } from 'app/styles'

import { CollectionScreenDetailsTile } from './CollectionScreenDetailsTile'

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
  const { id, searchCollection } = params ?? {}

  useEffect(() => {
    dispatch(fetchCollection(id))
  }, [dispatch, id])

  const cachedCollection = useSelector((state) =>
    getCollection(state, { id })
  ) as Collection

  const cachedUser = useSelector((state) =>
    getUser(state, { id: cachedCollection?.playlist_owner_id })
  )

  const collection = cachedCollection ?? searchCollection
  const user = cachedUser ?? searchCollection?.user

  if (!collection || !user) {
    console.warn(
      'Collection or user missing for CollectionScreen, preventing render'
    )
    return null
  }

  return <CollectionScreenComponent collection={collection} user={user} />
}

type CollectionScreenComponentProps = {
  collection: Collection | SearchPlaylist
  user: User | SearchUser
}

const CollectionScreenComponent = ({
  collection,
  user
}: CollectionScreenComponentProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const {
    _cover_art_sizes,
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

  const imageUrl = useCollectionCoverArt({
    id: playlist_id,
    sizes: _cover_art_sizes,
    size: SquareSizes.SIZE_480_BY_480
  })

  const currentUserId = useSelector(getUserId)
  const isOwner = currentUserId === playlist_owner_id

  const extraDetails = useMemo(
    () => [
      {
        label: 'Modified',
        value: formatDate(updated_at)
      }
    ],
    [updated_at]
  )

  const handlePressOverflow = useCallback(() => {
    const overflowActions = [
      isOwner || is_private
        ? null
        : has_current_user_reposted
        ? OverflowAction.UNREPOST
        : OverflowAction.REPOST,
      isOwner || is_private
        ? null
        : has_current_user_saved
        ? OverflowAction.UNFAVORITE
        : OverflowAction.FAVORITE,
      !is_album && isOwner ? OverflowAction.EDIT_PLAYLIST : null,
      isOwner && !is_album && is_private
        ? OverflowAction.PUBLISH_PLAYLIST
        : null,
      isOwner && !is_album ? OverflowAction.DELETE_PLAYLIST : null,
      OverflowAction.VIEW_ARTIST_PAGE
    ].filter(Boolean) as OverflowAction[]

    dispatch(
      openOverflowMenu({
        source: OverflowSource.COLLECTIONS,
        id: playlist_id,
        overflowActions
      })
    )
  }, [
    dispatch,
    playlist_id,
    isOwner,
    is_album,
    is_private,
    has_current_user_reposted,
    has_current_user_saved
  ])

  const handlePressSave = useCallback(() => {
    if (has_current_user_saved) {
      dispatch(unsaveCollection(playlist_id, FavoriteSource.COLLECTION_PAGE))
    } else {
      dispatch(saveCollection(playlist_id, FavoriteSource.COLLECTION_PAGE))
    }
  }, [dispatch, playlist_id, has_current_user_saved])

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
    navigation.push({
      native: {
        screen: 'Favorited',
        params: { id: playlist_id, favoriteType: FavoriteType.PLAYLIST }
      },
      web: { route: FAVORITING_USERS_ROUTE }
    })
  }, [dispatch, playlist_id, navigation])

  const handlePressReposts = useCallback(() => {
    dispatch(setRepost(playlist_id, RepostType.COLLECTION))
    navigation.push({
      native: {
        screen: 'Reposts',
        params: { id: playlist_id, repostType: RepostType.COLLECTION }
      },
      web: { route: REPOSTING_USERS_ROUTE }
    })
  }, [dispatch, playlist_id, navigation])

  return (
    <Screen>
      <VirtualizedScrollView
        listKey={`playlist-${collection.playlist_id}`}
        style={styles.root}
      >
        <CollectionScreenDetailsTile
          description={description ?? ''}
          extraDetails={extraDetails}
          hasReposted={has_current_user_reposted}
          hasSaved={has_current_user_saved}
          imageUrl={imageUrl}
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
    </Screen>
  )
}
