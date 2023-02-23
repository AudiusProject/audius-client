import { useCallback } from 'react'

import type { UID, Track, User } from '@audius/common'
import {
  SquareSizes,
  removeNullable,
  playerSelectors,
  FavoriteSource,
  RepostSource,
  ShareSource,
  Name,
  PlaybackSource,
  FavoriteType,
  getCanonicalName,
  formatSeconds,
  formatDate,
  accountSelectors,
  trackPageLineupActions,
  tracksSocialActions,
  OverflowAction,
  OverflowSource,
  mobileOverflowMenuUIActions,
  shareModalUIActions,
  RepostType,
  repostsUserListActions,
  favoritesUserListActions,
  reachabilitySelectors
} from '@audius/common'
import { Image, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconCollectible from 'app/assets/images/iconCollectible.svg'
import IconHidden from 'app/assets/images/iconHidden.svg'
import IconSpecialAccess from 'app/assets/images/iconSpecialAccess.svg'
import { Tag, Text } from 'app/components/core'
import { DetailsTile } from 'app/components/details-tile'
import type { DetailsTileDetail } from 'app/components/details-tile/types'
import type { ImageProps } from 'app/components/image/FastImage'
import { TrackImage } from 'app/components/image/TrackImage'
import { TrackDownloadStatusIndicator } from 'app/components/offline-downloads/TrackDownloadStatusIndicator'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useIsPremiumContentEnabled } from 'app/hooks/useIsPremiumContentEnabled'
import { useNavigation } from 'app/hooks/useNavigation'
import { make, track as record } from 'app/services/analytics'
import { getTrackOfflineDownloadStatus } from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'
import type { SearchTrack, SearchUser } from 'app/store/search/types'
import { flexRowCentered, makeStyles } from 'app/styles'
import { moodMap } from 'app/utils/moods'
import { useThemeColors } from 'app/utils/theme'

import { TrackScreenDownloadButtons } from './TrackScreenDownloadButtons'
const { getPlaying, getTrackId } = playerSelectors
const { setFavorite } = favoritesUserListActions
const { setRepost } = repostsUserListActions
const { requestOpen: requestOpenShareModal } = shareModalUIActions
const { open: openOverflowMenu } = mobileOverflowMenuUIActions
const { repostTrack, saveTrack, undoRepostTrack, unsaveTrack } =
  tracksSocialActions
const { tracksActions } = trackPageLineupActions
const { getUserId } = accountSelectors
const { getIsReachable } = reachabilitySelectors

const messages = {
  track: 'track',
  remix: 'remix',
  hiddenTrack: 'hidden track',
  collectibleGated: 'collectible gated',
  specialAccess: 'special access'
}

type TrackScreenDetailsTileProps = {
  track: Track | SearchTrack
  user: User | SearchUser
  uid: UID
  isLineupLoading: boolean
}

const recordPlay = (id, play = true) => {
  record(
    make({
      eventName: play ? Name.PLAYBACK_PLAY : Name.PLAYBACK_PAUSE,
      id: String(id),
      source: PlaybackSource.TRACK_PAGE
    })
  )
}

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  tags: {
    borderTopWidth: 1,
    borderTopColor: palette.neutralLight7,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingVertical: spacing(4)
  },

  moodEmoji: {
    marginLeft: spacing(1),
    width: 20,
    height: 20
  },

  hiddenDetailsTileWrapper: {
    ...flexRowCentered(),
    justifyContent: 'center',
    marginVertical: spacing(4)
  },

  hiddenTrackLabel: {
    marginTop: spacing(1),
    marginLeft: spacing(2),
    color: palette.accentOrange,
    fontFamily: typography.fontByWeight.demiBold,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase'
  },

  bottomContent: {
    marginHorizontal: spacing(3)
  },

  headerContainer: {
    ...flexRowCentered(),
    justifyContent: 'center'
  },
  headerText: {
    marginTop: spacing(4),
    marginBottom: spacing(4),
    letterSpacing: 2,
    lineHeight: 17,
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  headerView: {
    ...flexRowCentered()
  },
  premiumHeaderText: {
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontFamily: typography.fontByWeight.demiBold,
    fontSize: typography.fontSize.small,
    color: palette.accentBlue
  },
  premiumIcon: {
    marginRight: spacing(2.5),
    fill: palette.accentBlue
  },
  downloadStatusIndicator: {
    marginRight: spacing(2)
  }
}))

export const TrackScreenDetailsTile = ({
  track,
  user,
  uid,
  isLineupLoading
}: TrackScreenDetailsTileProps) => {
  const isPremiumContentEnabled = useIsPremiumContentEnabled()

  const styles = useStyles()
  const navigation = useNavigation()
  const { accentOrange, accentBlue } = useThemeColors()

  const isOfflineEnabled = useIsOfflineModeEnabled()
  const isReachable = useSelector(getIsReachable)
  const currentUserId = useSelector(getUserId)
  const dispatch = useDispatch()
  const playingId = useSelector(getTrackId)
  const isPlaying = useSelector(getPlaying)
  const isPlayingId = playingId === track.track_id

  const {
    _co_sign,
    created_at,
    credits_splits,
    description,
    duration,
    field_visibility,
    genre,
    has_current_user_reposted,
    has_current_user_saved,
    is_unlisted,
    is_premium: isPremium,
    mood,
    owner_id,
    play_count,
    release_date,
    remix_of,
    repost_count,
    save_count,
    tags,
    title,
    track_id
  } = track

  const isOwner = owner_id === currentUserId
  const hideFavorite = is_unlisted || (isPremiumContentEnabled && isPremium)
  const hideRepost =
    is_unlisted || !isReachable || (isPremiumContentEnabled && isPremium)

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
      value: release_date
        ? formatDate(release_date, 'ddd MMM DD YYYY HH:mm:ss')
        : formatDate(created_at, 'YYYY-MM-DD HH:mm:ss')
    },
    {
      icon:
        mood && mood in moodMap ? (
          <Image source={moodMap[mood]} style={styles.moodEmoji} />
        ) : null,
      isHidden: is_unlisted && !field_visibility?.mood,
      label: 'Mood',
      value: mood,
      valueStyle: { flexShrink: 0, marginTop: -2 }
    },
    { label: 'Credit', value: credits_splits }
  ].filter(({ isHidden, value }) => !isHidden && !!value)

  const renderImage = useCallback(
    (props: ImageProps) => (
      <TrackImage track={track} size={SquareSizes.SIZE_480_BY_480} {...props} />
    ),
    [track]
  )

  const handlePressPlay = useCallback(() => {
    if (isLineupLoading) return

    if (isPlaying && isPlayingId) {
      dispatch(tracksActions.pause())
      recordPlay(track_id, false)
    } else if (!isPlayingId) {
      dispatch(tracksActions.play(uid))
      recordPlay(track_id)
    } else {
      dispatch(tracksActions.play())
      recordPlay(track_id)
    }
  }, [track_id, uid, isPlayingId, dispatch, isPlaying, isLineupLoading])

  const handlePressFavorites = useCallback(() => {
    dispatch(setFavorite(track_id, FavoriteType.TRACK))
    navigation.push('Favorited', {
      id: track_id,
      favoriteType: FavoriteType.TRACK
    })
  }, [dispatch, track_id, navigation])

  const handlePressReposts = useCallback(() => {
    dispatch(setRepost(track_id, RepostType.TRACK))
    navigation.push('Reposts', { id: track_id, repostType: RepostType.TRACK })
  }, [dispatch, track_id, navigation])

  const handlePressTag = useCallback(
    (tag: string) => {
      navigation.push('TagSearch', { query: tag })
    },
    [navigation]
  )

  const handlePressSave = () => {
    if (!isOwner) {
      if (has_current_user_saved) {
        dispatch(unsaveTrack(track_id, FavoriteSource.TRACK_PAGE))
      } else {
        dispatch(saveTrack(track_id, FavoriteSource.TRACK_PAGE))
      }
    }
  }

  const handlePressRepost = () => {
    if (!isOwner) {
      if (has_current_user_reposted) {
        dispatch(undoRepostTrack(track_id, RepostSource.TRACK_PAGE))
      } else {
        dispatch(repostTrack(track_id, RepostSource.TRACK_PAGE))
      }
    }
  }

  const handlePressShare = () => {
    dispatch(
      requestOpenShareModal({
        type: 'track',
        trackId: track_id,
        source: ShareSource.PAGE
      })
    )
  }

  const handlePressOverflow = () => {
    const overflowActions = [
      OverflowAction.ADD_TO_PLAYLIST,
      user.does_current_user_follow
        ? OverflowAction.UNFOLLOW_ARTIST
        : OverflowAction.FOLLOW_ARTIST,
      OverflowAction.VIEW_ARTIST_PAGE,
      isOwner ? OverflowAction.EDIT_TRACK : null,
      isOwner ? OverflowAction.DELETE_TRACK : null
    ].filter(removeNullable)

    dispatch(
      openOverflowMenu({
        source: OverflowSource.TRACKS,
        id: track_id,
        overflowActions
      })
    )
  }

  const downloadStatus = useSelector(getTrackOfflineDownloadStatus(track_id))
  const getDownloadTextColor = () => {
    if (
      downloadStatus === OfflineDownloadStatus.SUCCESS ||
      downloadStatus === OfflineDownloadStatus.LOADING
    ) {
      return 'secondary'
    }
    return 'neutralLight4'
  }

  const renderHeaderText = () => {
    if (isPremiumContentEnabled && isPremium) {
      return (
        <View style={styles.headerView}>
          {track.premium_conditions?.nft_collection ? (
            <IconCollectible style={styles.premiumIcon} fill={accentBlue} />
          ) : (
            <IconSpecialAccess style={styles.premiumIcon} fill={accentBlue} />
          )}
          <Text style={styles.premiumHeaderText}>
            {track.premium_conditions?.nft_collection
              ? messages.collectibleGated
              : messages.specialAccess}
          </Text>
        </View>
      )
    }

    return (
      <Text
        style={styles.headerText}
        color={getDownloadTextColor()}
        weight='demiBold'
        fontSize='small'
      >
        {isRemix ? messages.remix : messages.track}
      </Text>
    )
  }

  const renderHeader = () => {
    return is_unlisted ? (
      <View style={styles.hiddenDetailsTileWrapper}>
        <IconHidden fill={accentOrange} />
        <Text style={styles.hiddenTrackLabel}>{messages.hiddenTrack}</Text>
      </View>
    ) : (
      <View style={styles.headerContainer}>
        <TrackDownloadStatusIndicator
          style={styles.downloadStatusIndicator}
          size={20}
          trackId={track_id}
        />
        {renderHeaderText()}
      </View>
    )
  }

  const renderTags = () => {
    if (is_unlisted && !field_visibility?.tags) {
      return null
    }

    return filteredTags.length > 0 ? (
      <View style={styles.tags}>
        {filteredTags.map((tag) => (
          <Tag key={tag} onPress={() => handlePressTag(tag)}>
            {tag}
          </Tag>
        ))}
      </View>
    ) : null
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
      <View style={styles.bottomContent}>
        {renderDownloadButtons()}
        {renderTags()}
      </View>
    )
  }

  return (
    <DetailsTile
      descriptionLinkPressSource='track page'
      coSign={_co_sign}
      description={description ?? undefined}
      details={details}
      hasReposted={has_current_user_reposted}
      hasSaved={has_current_user_saved}
      user={user}
      renderBottomContent={renderBottomContent}
      renderHeader={is_unlisted || isOfflineEnabled ? renderHeader : undefined}
      headerText={isRemix ? messages.remix : messages.track}
      hideFavorite={hideFavorite}
      hideRepost={hideRepost}
      hideShare={is_unlisted && !field_visibility?.share}
      hideOverflow={!isReachable}
      hideFavoriteCount={is_unlisted}
      hideListenCount={is_unlisted && !field_visibility?.play_count}
      hideRepostCount={is_unlisted}
      isPlaying={isPlaying && isPlayingId}
      onPressFavorites={handlePressFavorites}
      onPressOverflow={handlePressOverflow}
      onPressPlay={handlePressPlay}
      onPressRepost={handlePressRepost}
      onPressReposts={handlePressReposts}
      onPressSave={handlePressSave}
      onPressShare={handlePressShare}
      playCount={play_count}
      renderImage={renderImage}
      repostCount={repost_count}
      saveCount={save_count}
      title={title}
      track={track}
    />
  )
}
