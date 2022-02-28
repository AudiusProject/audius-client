import { useCallback } from 'react'

import {
  FavoriteSource,
  Name,
  RepostSource,
  ShareSource
} from 'audius-client/src/common/models/Analytics'
import { Collection } from 'audius-client/src/common/models/Collection'
import { SquareSizes } from 'audius-client/src/common/models/ImageSizes'
import { User } from 'audius-client/src/common/models/User'
import { getUserId } from 'audius-client/src/common/store/account/selectors'
import { makeGetTableMetadatas } from 'audius-client/src/common/store/lineup/selectors'
import {
  repostCollection,
  saveCollection,
  undoRepostCollection,
  unsaveCollection
} from 'audius-client/src/common/store/social/collections/actions'
import { requestOpen as requestOpenShareModal } from 'audius-client/src/common/store/ui/share-modal/slice'
import {
  formatDate,
  formatSecondsAsText
} from 'audius-client/src/common/utils/timeUtil'
import {
  getCollection,
  getCollectionStatus,
  getCollectionTracksLineup,
  getCollectionUid,
  getUser,
  getUserUid
} from 'common/store/pages/collection/selectors'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

import { useCollectionCoverArt } from 'app/hooks/useCollectionCoverArt'
import { usePushRouteWeb } from 'app/hooks/usePushRouteWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { getPlaying } from 'app/store/audio/selectors'
import { make, track } from 'app/utils/analytics'
import { formatCount } from 'app/utils/format'
import { ThemeColors } from 'app/utils/theme'

import { CollectionScreenDetailsTile } from './CollectionScreenDetailsTile'

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    root: {
      padding: 12
    },
    headerContainer: {
      marginBottom: 24
    }
  })

/**
 * `CollectionScreen` displays the details of a collection
 */
export const CollectionScreen = () => {
  const collection = useSelectorWeb(getCollection)
  const user = useSelectorWeb(getUser)

  if (!collection || !user) {
    console.warn(
      'Collection or user missing for CollectionScreen, preventing render'
    )
    return null
  }

  return (
    <CollectionScreenComponent
      collection={collection as Collection}
      user={user}
    />
  )
}

type CollectionScreenComponentProps = {
  collection: Collection
  user: User
}
const CollectionScreenComponent = ({
  collection,
  user
}: CollectionScreenComponentProps) => {
  const styles = useThemedStyles(createStyles)
  const {
    _cover_art_sizes,
    is_private,
    is_album,
    has_current_user_saved,
    has_current_user_reposted,
    playlist_owner_id,
    playlist_id,
    save_count,
    repost_count,
    playlist_name,
    updated_at
  } = collection

  const imageUrl = useCollectionCoverArt(
    playlist_id,
    _cover_art_sizes,
    SquareSizes.SIZE_480_BY_480
  )

  const extraDetails = [
    {
      label: 'Modified',
      value: formatDate(updated_at)
    }
  ]

  const isPlaying = useSelector(getPlaying)
  const currentQueueItem = useSelector(getCurrentQueueItem)

  const handlePlay = useCallback(() => {
    const trackPlay = () =>
      track(
        make({
          eventName: Name.PLAYBACK_PLAY,
          id: String(playingId),
          source: PlaybackSource.TRACK_PAGE
        })
      )
    if (isPlaying) {
      dispatchWeb(tracksActions.pause())
      record(
        make({
          eventName: Name.PLAYBACK_PAUSE,
          id: String(track_id),
          source: PlaybackSource.TRACK_PAGE
        })
      )
    } else if (
      playingUid !== uid &&
      queueTrack &&
      queueTrack?.trackId === track_id
    ) {
      dispatchWeb(tracksActions.play())
      trackPlay()
    } else {
      dispatchWeb(tracksActions.play(uid))
      trackPlay()
    }
  }, [playlist_id, uid, dispatchWeb, isPlaying, playingUid, queueTrack])

  const handlePressSave = () => {
    if (has_current_user_saved) {
      dispatchWeb(unsaveCollection(playlist_id, FavoriteSource.COLLECTION_PAGE))
    } else {
      dispatchWeb(saveCollection(playlist_id, FavoriteSource.COLLECTION_PAGE))
    }
  }

  const handlePressShare = () => {
    dispatchWeb(
      requestOpenShareModal({
        type: 'collection',
        collectionId: playlist_id,
        source: ShareSource.PAGE
      })
    )
  }

  const handlePressRepost = () => {
    if (has_current_user_reposted) {
      dispatchWeb(
        undoRepostCollection(playlist_id, RepostSource.COLLECTION_PAGE)
      )
    } else {
      dispatchWeb(repostCollection(playlist_id, RepostSource.COLLECTION_PAGE))
    }
  }
  return (
    <View style={styles.root}>
      <View style={styles.headerContainer}>
        <CollectionScreenDetailsTile
          onPressSave={handlePressSave}
          onPressShare={handlePressShare}
          onPressRepost={handlePressRepost}
          onPressShare={handlePressShare}
          extraDetails={extraDetails}
          imageUrl={imageUrl}
          user={user}
          isPrivate={is_private}
          isAlbum={is_album}
          hasReposted={has_current_user_reposted}
          hasSaved={has_current_user_saved}
          ownerId={playlist_owner_id}
          saveCount={save_count}
          repostCount={repost_count}
          title={playlist_name}
        />
      </View>
    </View>
  )
}
