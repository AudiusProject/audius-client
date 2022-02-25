import { useCallback } from 'react'

import {
  FavoriteSource,
  RepostSource,
  ShareSource,
  Name,
  PlaybackSource
} from 'audius-client/src/common/models/Analytics'
import { FavoriteType } from 'audius-client/src/common/models/Favorite'
import { ID } from 'audius-client/src/common/models/Identifiers'
import { SquareSizes } from 'audius-client/src/common/models/ImageSizes'
import { Track } from 'audius-client/src/common/models/Track'
import { User } from 'audius-client/src/common/models/User'
import { getUserId } from 'audius-client/src/common/store/account/selectors'
import { tracksActions } from 'audius-client/src/common/store/pages/track/lineup/actions'
import {
  repostTrack,
  saveTrack,
  undoRepostTrack,
  unsaveTrack
} from 'audius-client/src/common/store/social/tracks/actions'
import {
  OverflowAction,
  OverflowSource
} from 'audius-client/src/common/store/ui/mobile-overflow-menu/types'
import { requestOpen as requestOpenShareModal } from 'audius-client/src/common/store/ui/share-modal/slice'
import { RepostType } from 'audius-client/src/common/store/user-list/reposts/types'
import { getCanonicalName } from 'audius-client/src/common/utils/genres'
import {
  formatSeconds,
  formatDate
} from 'audius-client/src/common/utils/timeUtil'
import { open as openOverflowMenu } from 'common/store/ui/mobile-overflow-menu/slice'
import { Image, Pressable, View } from 'react-native'
import { useSelector } from 'react-redux'

import { Text } from 'app/components/core'
import { DetailsTile } from 'app/components/details-tile'
import {
  DetailsTileDetail,
  DetailsTileParentProps
} from 'app/components/details-tile/types'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { useTrackCoverArt } from 'app/hooks/useTrackCoverArt'
import { getPlaying, getPlayingUid, getTrack } from 'app/store/audio/selectors'
import { makeStyles } from 'app/styles'
import { make, track as record } from 'app/utils/analytics'
import { moodMap } from 'app/utils/moods'

import { TrackScreenDownloadButtons } from './TrackScreenDownloadButtons'

const messages = {
  track: 'TRACK',
  remix: 'REMIX'
}

type TrackScreenDetailsTileProps = DetailsTileParentProps & {
  track: Track
  user: User
}

const useStyles = makeStyles(({ palette }) => ({
  tags: {
    borderTopWidth: 1,
    borderTopColor: palette.neutralLight7,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingVertical: 16
  },

  tag: {
    margin: 4,
    borderRadius: 2,
    backgroundColor: palette.neutralLight4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: palette.white,
    textTransform: 'uppercase',
    overflow: 'hidden'
  },

  moodEmoji: {
    marginLeft: 4,
    width: 20,
    height: 20
  },

  hiddenDetailsTileWrapper: {
    marginBottom: 12
  }
}))

export const TrackScreenDetailsTile = ({
  track,
  user,
  uid,
  ...detailsTileProps
}: TrackScreenDetailsTileProps) => {
  const styles = useStyles()
  const currentUserId = useSelectorWeb(getUserId)
  const dispatchWeb = useDispatchWeb()
  const playingUid = useSelector(getPlayingUid)
  const queueTrack = useSelector(getTrack)
  const isPlaying = useSelector(getPlaying)

  const {
    _co_sign,
    _cover_art_sizes,
    created_at,
    credits_splits,
    duration,
    field_visibility,
    genre,
    has_current_user_reposted,
    has_current_user_saved,
    is_unlisted,
    mood,
    owner_id,
    release_date,
    remix_of,
    tags,
    title,
    track_id
  } = track

  const imageUrl = useTrackCoverArt(
    track_id,
    _cover_art_sizes,
    SquareSizes.SIZE_480_BY_480
  )

  const isOwner = owner_id === currentUserId

  const remixParentTrackId = remix_of?.tracks?.[0]?.parent_track_id
  const isRemix = !!remixParentTrackId

  const filteredTags = (tags || '').split(',').filter(Boolean)

  const details: DetailsTileDetail[] = [
    { label: 'Duration', value: formatSeconds(duration) },
    {
      isHidden: is_unlisted && !field_visibility?.genre,
      label: 'Genre',
      value: getCanonicalName(genre)
    },
    {
      isHidden: is_unlisted,
      label: 'Released',
      value: formatDate(release_date || created_at)
    },
    {
      icon:
        mood && mood in moodMap ? (
          <Image source={moodMap[mood]} style={styles.moodEmoji} />
        ) : null,
      isHidden: is_unlisted && !field_visibility?.mood,
      label: 'Mood',
      value: mood
    },
    { label: 'Credit', value: credits_splits }
  ].filter(({ isHidden, value }) => !isHidden && !!value)

  const handlePressPlay = useCallback(() => {
    const trackPlay = () =>
      record(
        make({
          eventName: Name.PLAYBACK_PLAY,
          id: String(track_id),
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
  }, [track_id, uid, dispatchWeb, isPlaying, playingUid, queueTrack])

  const handlePressTag = useCallback((tag: string) => {
    // TODO: navigate to search screen
    // goToSearchResultsPage(`#${tag}`)
  }, [])

  const handlePressSave = () => {
    if (!isOwner) {
      if (has_current_user_saved) {
        dispatchWeb(unsaveTrack(track_id, FavoriteSource.TRACK_PAGE))
      } else {
        dispatchWeb(saveTrack(track_id, FavoriteSource.TRACK_PAGE))
      }
    }
  }

  const handlePressRepost = () => {
    if (!isOwner) {
      if (has_current_user_reposted) {
        dispatchWeb(undoRepostTrack(track_id, RepostSource.TRACK_PAGE))
      } else {
        dispatchWeb(repostTrack(track_id, RepostSource.TRACK_PAGE))
      }
    }
  }

  const handlePressShare = () => {
    dispatchWeb(
      requestOpenShareModal({
        type: 'track',
        trackId: track_id,
        source: ShareSource.PAGE
      })
    )
  }
  const handlePressOverflow = () => {
    const overflowActions = [
      isOwner || is_unlisted
        ? null
        : has_current_user_reposted
        ? OverflowAction.UNREPOST
        : OverflowAction.REPOST,
      isOwner || is_unlisted
        ? null
        : has_current_user_saved
        ? OverflowAction.UNFAVORITE
        : OverflowAction.FAVORITE,
      OverflowAction.ADD_TO_PLAYLIST,
      user.does_current_user_follow
        ? OverflowAction.UNFOLLOW_ARTIST
        : OverflowAction.FOLLOW_ARTIST,
      OverflowAction.VIEW_ARTIST_PAGE
    ].filter(Boolean) as OverflowAction[]

    dispatchWeb(
      openOverflowMenu({
        source: OverflowSource.TRACKS,
        id: track_id,
        overflowActions
      })
    )
  }

  const renderHiddenHeader = () => {
    return (
      <View style={styles.hiddenDetailsTileWrapper}>
        {/* <HiddeDetailsTile /> */}
      </View>
    )
  }

  const renderTags = () => {
    if (is_unlisted && !field_visibility?.tags) {
      return null
    }

    return (
      <>
        {filteredTags.length > 0 ? (
          <View style={styles.tags}>
            {filteredTags.map(tag => (
              <Pressable key={tag} onPress={() => handlePressTag(tag)}>
                <Text style={styles.tag} variant='label'>
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </>
    )
  }

  const renderDownloadButtons = () => {
    return (
      <TrackScreenDownloadButtons
        following={user.does_current_user_follow}
        isOwner={isOwner}
        trackId={track_id}
        user={user}
      />
    )
  }

  const renderBottomContent = () => {
    return (
      <>
        {renderDownloadButtons()}
        {renderTags()}
      </>
    )
  }

  return (
    <DetailsTile
      {...detailsTileProps}
      descriptionLinkPressSource='track page'
      coSign={_co_sign}
      details={details}
      favoriteType={FavoriteType.TRACK}
      id={track_id}
      imageUrl={imageUrl}
      item={track}
      user={user}
      renderBottomContent={renderBottomContent}
      renderHeader={is_unlisted ? renderHiddenHeader : undefined}
      headerText={isRemix ? messages.remix : messages.track}
      hideFavorite={is_unlisted}
      hideRepost={is_unlisted}
      hideShare={is_unlisted && !field_visibility?.share}
      hideFavoriteCount={is_unlisted}
      hideListenCount={is_unlisted && !field_visibility?.play_count}
      hideRepostCount={is_unlisted}
      onPressOverflow={handlePressOverflow}
      onPressPlay={handlePressPlay}
      onPressRepost={handlePressRepost}
      onPressSave={handlePressSave}
      onPressShare={handlePressShare}
      repostType={RepostType.TRACK}
      title={title}
    />
  )
}
