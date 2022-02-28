import { useMemo } from 'react'

import { ID } from 'audius-client/src/common/models/Identifiers'
import { User } from 'audius-client/src/common/models/User'
import { getUserId } from 'audius-client/src/common/store/account/selectors'
import { makeGetTableMetadatas } from 'audius-client/src/common/store/lineup/selectors'
import { getCollectionTracksLineup } from 'audius-client/src/common/store/pages/collection/selectors'
import {
  OverflowAction,
  OverflowSource
} from 'audius-client/src/common/store/ui/mobile-overflow-menu/types'
import { formatSecondsAsText } from 'audius-client/src/common/utils/timeUtil'
import { open as openOverflowMenu } from 'common/store/ui/mobile-overflow-menu/slice'

import { DetailsTile } from 'app/components/details-tile'
import { DetailsTileDetail } from 'app/components/details-tile/types'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { GestureResponderHandler } from 'app/types/gesture'
import { formatCount } from 'app/utils/format'

const messages = {
  album: 'Album',
  playlist: 'Playlist',
  privatePlaylist: 'Private Playlist',
  publishing: 'Publishing...'
}

type CollectionScreenDetailsTileProps = {
  extraDetails: DetailsTileDetail[]
  onPressSave: GestureResponderHandler
  onPressShare: GestureResponderHandler
  onPressRepost: GestureResponderHandler
  description: string
  isPrivate?: boolean
  isAlbum?: boolean
  hasReposted?: boolean
  imageUrl: string
  hasSaved?: boolean
  ownerId?: ID
  saveCount?: number
  repostCount?: number
  user: User
  title: string
}

const getTracksLineup = makeGetTableMetadatas(getCollectionTracksLineup)

export const CollectionScreenDetailsTile = ({
  imageUrl,
  extraDetails,
  description,
  isPrivate,
  isAlbum,
  onPressRepost,
  onPressSave,
  onPressShare,
  hasReposted,
  hasSaved,
  saveCount,
  ownerId,
  repostCount,
  user,
  title,
  ...detailsTileProps
}: CollectionScreenDetailsTileProps) => {
  const currentUserId = useSelectorWeb(getUserId)
  const dispatchWeb = useDispatchWeb()
  const tracksLineup = useSelectorWeb(getTracksLineup)
  const numTracks = tracksLineup.entries.length

  const isOwner = currentUserId === ownerId

  const duration = tracksLineup.entries?.reduce(
    (duration, entry) => duration + entry.duration,
    0
  )

  const details = [
    {
      label: 'Tracks',
      value: formatCount(numTracks)
    },
    {
      label: 'Duration',
      value: formatSecondsAsText(duration)
    },
    ...extraDetails
  ].filter(({ isHidden, value }) => !isHidden && !!value)

  const handlePressOverflow = () => {
    const overflowActions = [
      isOwner || isPrivate
        ? null
        : hasReposted
        ? OverflowAction.UNREPOST
        : OverflowAction.REPOST,
      isOwner || isPrivate
        ? null
        : hasSaved
        ? OverflowAction.UNFAVORITE
        : OverflowAction.FAVORITE,
      !isAlbum && isOwner ? OverflowAction.EDIT_PLAYLIST : null,
      isOwner && !isAlbum && isPrivate ? OverflowAction.PUBLISH_PLAYLIST : null,
      isOwner && !isAlbum ? OverflowAction.DELETE_PLAYLIST : null,
      OverflowAction.VIEW_ARTIST_PAGE
    ].filter(Boolean) as OverflowAction[]

    dispatchWeb(
      openOverflowMenu({
        source: OverflowSource.COLLECTIONS,
        id: playlist_id,
        overflowActions
      })
    )
  }

  const headerText = useMemo(() => {
    if (isAlbum) {
      return messages.album
    }

    if (isPrivate) {
      return messages.privatePlaylist
    }

    return messages.playlist
  }, [isAlbum, isPrivate])

  return (
    <DetailsTile
      {...detailsTileProps}
      description={description ?? undefined}
      descriptionLinkPressSource='collection page'
      details={details}
      imageUrl={imageUrl}
      user={user}
      hasSaved={hasSaved}
      hasReposted={hasReposted}
      headerText={headerText}
      //   hideRepost={isSmartCollection}
      //   hideShare={isSmartCollection}
      //   hideFavoriteCount={isSmartCollection}
      //   hideRepostCount={isSmartCollection}
      hideListenCount={true}
      onPressOverflow={handlePressOverflow}
      onPressPlay={handlePressPlay}
      onPressRepost={onPressRepost}
      onPressSave={onPressSave}
      onPressShare={onPressShare}
      saveCount={saveCount}
      repostCount={repostCount}
      title={title}
    />
  )
}
