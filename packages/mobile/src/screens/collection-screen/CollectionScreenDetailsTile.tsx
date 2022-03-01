import { ReactNode, useCallback, useMemo } from 'react'

import { Name, PlaybackSource } from 'audius-client/src/common/models/Analytics'
import { ID, UID } from 'audius-client/src/common/models/Identifiers'
import Status from 'audius-client/src/common/models/Status'
import { User } from 'audius-client/src/common/models/User'
import { makeGetTableMetadatas } from 'audius-client/src/common/store/lineup/selectors'
import { tracksActions } from 'audius-client/src/common/store/pages/collection/lineup/actions'
import { getCollectionTracksLineup } from 'audius-client/src/common/store/pages/collection/selectors'
import { formatSecondsAsText } from 'audius-client/src/common/utils/timeUtil'
import { Text, View } from 'react-native'
import { useSelector } from 'react-redux'

import { DetailsTile } from 'app/components/details-tile'
import { DetailsTileDetail } from 'app/components/details-tile/types'
import { TrackList } from 'app/components/track-list'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { getPlaying, getPlayingUid, getTrack } from 'app/store/audio/selectors'
import { makeStyles } from 'app/styles'
import { GestureResponderHandler } from 'app/types/gesture'
import { make, track } from 'app/utils/analytics'
import { formatCount } from 'app/utils/format'

const messages = {
  album: 'Album',
  playlist: 'Playlist',
  empty: 'This playlist is empty.',
  privatePlaylist: 'Private Playlist',
  publishing: 'Publishing...'
}

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  trackListDivider: {
    marginHorizontal: spacing(6),
    borderTopWidth: 1,
    borderTopColor: palette.neutralLight7
  },
  empty: {
    ...typography.body,
    color: palette.neutral,
    marginBottom: spacing(8),
    alignSelf: 'center'
  }
}))

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
  const styles = useStyles()
  const dispatchWeb = useDispatchWeb()
  const tracksLineup = useSelectorWeb(getTracksLineup)
  const tracksLoading = tracksLineup.status === Status.LOADING
  const numTracks = tracksLineup.entries.length

  const duration = tracksLineup.entries?.reduce(
    (duration, entry) => duration + entry.duration,
    0
  )

  const details =
    numTracks > 0
      ? [
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
      : []

  const isPlaying = useSelector(getPlaying)
  const playingUid = useSelector(getPlayingUid)
  const playingTrack = useSelector(getTrack)
  const trackId = playingTrack?.trackId

  const isQueued = tracksLineup.entries.some(entry => playingUid === entry.uid)

  const recordPlay = (id, play = true) => {
    track(
      make({
        eventName: play ? Name.PLAYBACK_PLAY : Name.PLAYBACK_PAUSE,
        id: String(id),
        source: PlaybackSource.PLAYLIST_PAGE
      })
    )
  }

  const handlePressPlay = useCallback(() => {
    if (isPlaying && isQueued) {
      dispatchWeb(tracksActions.pause())
      recordPlay(trackId, false)
    } else if (!isPlaying && isQueued) {
      dispatchWeb(tracksActions.play())
      recordPlay(trackId)
    } else if (tracksLineup.entries.length > 0) {
      dispatchWeb(tracksActions.play(tracksLineup.entries[0].uid))
      recordPlay(tracksLineup.entries[0].track_id)
    }
  }, [dispatchWeb, isPlaying, trackId, tracksLineup, isQueued])

  const handlePressTrackListItemPlay = useCallback(
    (uid: UID, id: ID) => {
      if (isPlaying && playingUid === uid) {
        dispatchWeb(tracksActions.pause())
        recordPlay(id, false)
      } else if (playingUid !== uid) {
        dispatchWeb(tracksActions.play(uid))
        recordPlay(id)
      } else {
        dispatchWeb(tracksActions.play())
        recordPlay(id)
      }
    },
    [dispatchWeb, isPlaying, playingUid]
  )

  const headerText = useMemo(() => {
    if (isAlbum) {
      return messages.album
    }

    if (isPrivate) {
      return messages.privatePlaylist
    }

    return messages.playlist
  }, [isAlbum, isPrivate])

  const renderTrackList = () => {
    const trackMetadatas = tracksLineup.entries.map(track => ({
      isLoading: false,
      isSaved: track.has_current_user_saved,
      isReposted: track.has_current_user_reposted,
      isActive: playingUid === track.uid,
      isPlaying: isPlaying && playingUid === track.uid,
      artistName: track.user.name,
      artistHandle: track.user.handle,
      trackTitle: track.title,
      trackId: track.track_id,
      uid: track.uid,
      isDeleted: track.is_delete || !!track.user.is_deactivated,
      user: track.user
    }))

    return !tracksLoading && trackMetadatas.length === 0 ? (
      <Text style={styles.empty}>{messages.empty}</Text>
    ) : (
      <>
        <View style={styles.trackListDivider} />
        <TrackList
          tracks={trackMetadatas ?? []}
          showDivider
          togglePlay={handlePressTrackListItemPlay}
        />
      </>
    )
  }

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
      renderBottomContent={renderTrackList}
      repostCount={repostCount}
      saveCount={saveCount}
      title={title}
      user={user}
    />
  )
}
