import { useCallback, useLayoutEffect } from 'react'

import type { Nullable, Track } from '@audius/common'
import {
  FeatureFlags,
  playbackPositionSelectors,
  Genre,
  removeNullable,
  FavoriteSource,
  reachabilitySelectors,
  RepostSource,
  ShareSource,
  accountSelectors,
  castSelectors,
  castActions,
  tracksSocialActions,
  OverflowAction,
  OverflowSource,
  mobileOverflowMenuUIActions,
  shareModalUIActions
} from '@audius/common'
import { View, Platform } from 'react-native'
import { CastButton } from 'react-native-google-cast'
import { useDispatch, useSelector } from 'react-redux'

import IconAirplay from 'app/assets/images/iconAirplay.svg'
import IconChromecast from 'app/assets/images/iconChromecast.svg'
import IconKebabHorizontal from 'app/assets/images/iconKebabHorizontal.svg'
import IconShare from 'app/assets/images/iconShare.svg'
import { useAirplay } from 'app/components/audio/Airplay'
import { IconButton } from 'app/components/core'
import { useIsGatedContentEnabled } from 'app/hooks/useIsGatedContentEnabled'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useFeatureFlag } from 'app/hooks/useRemoteConfig'
import { useToast } from 'app/hooks/useToast'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { FavoriteButton } from './FavoriteButton'
import { RepostButton } from './RepostButton'

const { getAccountUser } = accountSelectors
const { requestOpen: requestOpenShareModal } = shareModalUIActions
const { open: openOverflowMenu } = mobileOverflowMenuUIActions
const { repostTrack, saveTrack, undoRepostTrack, unsaveTrack } =
  tracksSocialActions
const { updateMethod } = castActions
const { getMethod: getCastMethod, getIsCasting } = castSelectors
const { getTrackPosition } = playbackPositionSelectors

const { getIsReachable } = reachabilitySelectors

const messages = {
  repostProhibited: "You can't Repost your own Track!",
  favoriteProhibited: "You can't Favorite your own Track!"
}

const useStyles = makeStyles(({ palette, spacing }) => ({
  container: {
    marginTop: spacing(10),
    height: spacing(12),
    borderRadius: 10,
    backgroundColor: palette.neutralLight8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  button: {
    flexGrow: 1,
    alignItems: 'center'
  },
  animatedIcon: {
    width: spacing(7),
    height: spacing(7)
  },
  icon: {
    width: spacing(6),
    height: spacing(6)
  }
}))

type ActionsBarProps = {
  track: Nullable<Track>
}

export const ActionsBar = ({ track }: ActionsBarProps) => {
  const isGatedContentEnabled = useIsGatedContentEnabled()
  const styles = useStyles()
  const { toast } = useToast()
  const castMethod = useSelector(getCastMethod)
  const isCasting = useSelector(getIsCasting)
  const accountUser = useSelector(getAccountUser)
  const { neutral, neutralLight6, primary } = useThemeColors()
  const dispatch = useDispatch()
  const isOfflineModeEnabled = useIsOfflineModeEnabled()
  const isReachable = useSelector(getIsReachable)
  const { isEnabled: isNewPodcastControlsEnabled } = useFeatureFlag(
    FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED,
    FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED_FALLBACK
  )

  useLayoutEffect(() => {
    if (Platform.OS === 'android' && castMethod === 'airplay') {
      dispatch(updateMethod({ method: 'chromecast' }))
    }
  }, [castMethod, dispatch])

  const handleFavorite = useCallback(() => {
    if (track) {
      if (track.has_current_user_saved) {
        dispatch(unsaveTrack(track.track_id, FavoriteSource.NOW_PLAYING))
      } else if (track.owner_id === accountUser?.user_id) {
        toast({ content: messages.favoriteProhibited })
      } else {
        dispatch(saveTrack(track.track_id, FavoriteSource.NOW_PLAYING))
      }
    }
  }, [accountUser?.user_id, dispatch, toast, track])

  const handleRepost = useCallback(() => {
    if (track) {
      if (track.has_current_user_reposted) {
        dispatch(undoRepostTrack(track.track_id, RepostSource.NOW_PLAYING))
      } else if (track.owner_id === accountUser?.user_id) {
        toast({ content: messages.repostProhibited })
      } else {
        dispatch(repostTrack(track.track_id, RepostSource.NOW_PLAYING))
      }
    }
  }, [accountUser?.user_id, dispatch, toast, track])

  const handleShare = useCallback(() => {
    if (track) {
      dispatch(
        requestOpenShareModal({
          type: 'track',
          trackId: track.track_id,
          source: ShareSource.NOW_PLAYING
        })
      )
    }
  }, [dispatch, track])

  const playbackPositionInfo = useSelector((state) =>
    getTrackPosition(state, {
      trackId: track?.track_id,
      userId: accountUser?.user_id
    })
  )
  const onPressOverflow = useCallback(() => {
    if (track) {
      const isLongFormContent =
        track.genre === Genre.PODCASTS || track.genre === Genre.AUDIOBOOKS
      const overflowActions = [
        !isGatedContentEnabled || !track.is_premium
          ? OverflowAction.ADD_TO_PLAYLIST
          : null,
        isNewPodcastControlsEnabled && isLongFormContent
          ? OverflowAction.VIEW_EPISODE_PAGE
          : OverflowAction.VIEW_TRACK_PAGE,
        isNewPodcastControlsEnabled && isLongFormContent
          ? playbackPositionInfo?.status === 'COMPLETED'
            ? OverflowAction.MARK_AS_UNPLAYED
            : OverflowAction.MARK_AS_PLAYED
          : null,
        OverflowAction.VIEW_ARTIST_PAGE
      ].filter(removeNullable)

      dispatch(
        openOverflowMenu({
          source: OverflowSource.TRACKS,
          id: track.track_id,
          overflowActions
        })
      )
    }
  }, [
    track,
    isGatedContentEnabled,
    isNewPodcastControlsEnabled,
    playbackPositionInfo?.status,
    dispatch
  ])

  const { openAirplayDialog } = useAirplay()

  const renderCastButton = () => {
    if (castMethod === 'airplay') {
      return (
        <IconButton
          onPress={openAirplayDialog}
          icon={IconAirplay}
          fill={isCasting ? primary : neutral}
          styles={{ icon: styles.icon, root: styles.button }}
        />
      )
    }
    return isOfflineModeEnabled && !isReachable ? (
      <View style={{ ...styles.button, width: 24 }}>
        <IconChromecast
          fill={neutralLight6}
          height={30}
          width={30}
          style={{ transform: [{ scaleX: -1 }] }}
        />
      </View>
    ) : (
      <CastButton
        style={{
          ...styles.button,
          ...styles.icon,
          tintColor: isCasting ? primary : neutral
        }}
      />
    )
  }

  const renderRepostButton = () => {
    return (
      <RepostButton
        iconIndex={track?.has_current_user_reposted ? 1 : 0}
        onPress={handleRepost}
        style={styles.button}
        wrapperStyle={styles.animatedIcon}
        isDisabled={!isReachable}
        isOwner={track?.owner_id === accountUser?.user_id}
      />
    )
  }

  const renderFavoriteButton = () => {
    return (
      <FavoriteButton
        iconIndex={track?.has_current_user_saved ? 1 : 0}
        onPress={handleFavorite}
        style={styles.button}
        wrapperStyle={styles.animatedIcon}
        isOwner={track?.owner_id === accountUser?.user_id}
      />
    )
  }

  const renderShareButton = () => {
    return (
      <IconButton
        icon={IconShare}
        styles={{ icon: styles.icon, root: styles.button }}
        onPress={handleShare}
      />
    )
  }

  const renderOptionsButton = () => {
    return (
      <IconButton
        icon={IconKebabHorizontal}
        styles={{ icon: styles.icon, root: styles.button }}
        onPress={onPressOverflow}
        isDisabled={!isReachable}
      />
    )
  }

  return (
    <View style={styles.container}>
      {renderCastButton()}
      {renderRepostButton()}
      {renderFavoriteButton()}
      {renderShareButton()}
      {renderOptionsButton()}
    </View>
  )
}
