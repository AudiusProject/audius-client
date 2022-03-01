import { ReactNode, useCallback, useMemo } from 'react'

import { Name, PlaybackSource } from 'audius-client/src/common/models/Analytics'
import { User } from 'audius-client/src/common/models/User'
import { makeGetTableMetadatas } from 'audius-client/src/common/store/lineup/selectors'
import { tracksActions } from 'audius-client/src/common/store/pages/collection/lineup/actions'
import { getCollectionTracksLineup } from 'audius-client/src/common/store/pages/collection/selectors'
import { formatSecondsAsText } from 'audius-client/src/common/utils/timeUtil'
import { useSelector } from 'react-redux'

import { DetailsTile } from 'app/components/details-tile'
import { DetailsTileDetail } from 'app/components/details-tile/types'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { getPlaying, getPlayingUid, getTrack } from 'app/store/audio/selectors'
import { GestureResponderHandler } from 'app/types/gesture'
import { make, track } from 'app/utils/analytics'
import { formatCount } from 'app/utils/format'

const messages = {
  album: 'Album',
  playlist: 'Playlist',
  privatePlaylist: 'Private Playlist',
  publishing: 'Publishing...'
}

type CollectionScreenDetailsTileProps = {
  description: string
  extraDetails?: DetailsTileDetail[]
  hasReposted?: boolean
  hasSaved?: boolean
  hideFavoriteCount?: boolean
  hideOverflow?: boolean
  hideRepost?: boolean
  hideRepostCount?: boolean
  hideShare?: boolean
  imageUrl?: string
  isAlbum?: boolean
  isPrivate?: boolean
  onPressFavorites?: GestureResponderHandler
  onPressOverflow?: GestureResponderHandler
  onPressRepost?: GestureResponderHandler
  onPressReposts?: GestureResponderHandler
  onPressSave?: GestureResponderHandler
  onPressShare?: GestureResponderHandler
  renderImage?: () => ReactNode
  repostCount?: number
  saveCount?: number
  title: string
  user?: User
}

const getTracksLineup = makeGetTableMetadatas(getCollectionTracksLineup)

export const CollectionScreenDetailsTile = ({
  description,
  extraDetails = [],
  hasReposted,
  hasSaved,
  imageUrl,
  isAlbum,
  isPrivate,
  hideFavoriteCount,
  hideOverflow,
  hideRepost,
  hideRepostCount,
  hideShare,
  onPressFavorites,
  onPressOverflow,
  onPressRepost,
  onPressReposts,
  onPressSave,
  onPressShare,
  renderImage,
  repostCount,
  saveCount,
  title,
  user
}: CollectionScreenDetailsTileProps) => {
  const dispatchWeb = useDispatchWeb()
  const tracksLineup = useSelectorWeb(getTracksLineup)
  const numTracks = tracksLineup.entries.length

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

  const isPlaying = useSelector(getPlaying)
  const playingUid = useSelector(getPlayingUid)
  const playingTrack = useSelector(getTrack)
  const trackId = playingTrack?.trackId

  const isQueued = tracksLineup.entries.some(entry => playingUid === entry.uid)

  const handlePressPlay = useCallback(() => {
    if (isPlaying && isQueued) {
      dispatchWeb(tracksActions.pause())
      track(
        make({
          eventName: Name.PLAYBACK_PAUSE,
          id: String(trackId),
          source: PlaybackSource.PLAYLIST_PAGE
        })
      )
    } else if (!isPlaying && isQueued) {
      dispatchWeb(tracksActions.play())
      track(
        make({
          eventName: Name.PLAYBACK_PLAY,
          id: String(trackId),
          source: PlaybackSource.PLAYLIST_PAGE
        })
      )
    } else if (tracksLineup.entries.length > 0) {
      dispatchWeb(tracksActions.play(tracksLineup.entries[0].uid))
      track(
        make({
          eventName: Name.PLAYBACK_PLAY,
          id: `${tracksLineup.entries[0].track_id}`,
          source: PlaybackSource.PLAYLIST_PAGE
        })
      )
    }
  }, [dispatchWeb, isPlaying, trackId, tracksLineup, isQueued])

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
      description={description ?? undefined}
      descriptionLinkPressSource='collection page'
      details={details}
      hasReposted={hasReposted}
      hasSaved={hasSaved}
      headerText={headerText}
      hideListenCount={true}
      hideFavoriteCount={hideFavoriteCount}
      hideOverflow={hideOverflow}
      hideRepost={hideRepost}
      hideRepostCount={hideRepostCount}
      hideShare={hideShare}
      imageUrl={imageUrl}
      onPressFavorites={onPressFavorites}
      onPressOverflow={onPressOverflow}
      onPressPlay={handlePressPlay}
      onPressRepost={onPressRepost}
      onPressReposts={onPressReposts}
      onPressSave={onPressSave}
      onPressShare={onPressShare}
      renderImage={renderImage}
      repostCount={repostCount}
      saveCount={saveCount}
      title={title}
      user={user}
    />
  )
}
