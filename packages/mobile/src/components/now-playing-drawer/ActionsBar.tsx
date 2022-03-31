import { useCallback, useMemo } from 'react'

import {
  FavoriteSource,
  RepostSource,
  ShareSource
} from 'audius-client/src/common/models/Analytics'
import {
  repostTrack,
  saveTrack,
  undoRepostTrack,
  unsaveTrack
} from 'audius-client/src/common/store/social/tracks/actions'
import { Track } from 'common/models/Track'
import { getUserId } from 'common/store/account/selectors'
import {
  getMethod as getCastMethod,
  getIsCasting
} from 'common/store/cast/selectors'
import { open as openOverflowMenu } from 'common/store/ui/mobile-overflow-menu/slice'
import {
  OverflowAction,
  OverflowSource
} from 'common/store/ui/mobile-overflow-menu/types'
import { requestOpen as requestOpenShareModal } from 'common/store/ui/share-modal/slice'
import { View, StyleSheet } from 'react-native'

import IconFavoriteOffLight from 'app/assets/animations/iconFavoriteOffLight.json'
import IconFavoriteOnLight from 'app/assets/animations/iconFavoriteOnLight.json'
import IconRepostOffLight from 'app/assets/animations/iconRepostOffLight.json'
import IconRepostOnLight from 'app/assets/animations/iconRepostOnLight.json'
import IconAirplay from 'app/assets/images/iconAirplay.svg'
import IconChromecast from 'app/assets/images/iconChromecast.svg'
import IconKebabHorizontal from 'app/assets/images/iconKebabHorizontal.svg'
import IconShare from 'app/assets/images/iconShare.svg'
import { useAirplay } from 'app/components/audio/Airplay'
import { AnimatedButton, IconButton } from 'app/components/core'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import { colorize } from 'app/utils/colorizeLottie'
import { ThemeColors, useThemeColors } from 'app/utils/theme'

import { useChromecast } from '../audio/GoogleCast'

const createStyles = (themeColors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginTop: 40,
      height: 48,
      borderRadius: 10,
      backgroundColor: themeColors.neutralLight8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly'
    },
    button: {
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center'
    },
    animatedIcon: {
      width: 28,
      height: 28
    },
    icon: {
      width: 24,
      height: 24
    }
  })

type ActionsBarProps = {
  track: Track
}

export const ActionsBar = ({ track }: ActionsBarProps) => {
  const styles = useThemedStyles(createStyles)
  const currentUserId = useSelectorWeb(getUserId)
  const castMethod = useSelectorWeb(getCastMethod)
  const isCasting = useSelectorWeb(getIsCasting)
  const { neutral, primary } = useThemeColors()

  const dispatchWeb = useDispatchWeb()

  const onToggleFavorite = useCallback(() => {
    if (track) {
      if (track.has_current_user_saved) {
        dispatchWeb(unsaveTrack(track.track_id, FavoriteSource.NOW_PLAYING))
      } else {
        dispatchWeb(saveTrack(track.track_id, FavoriteSource.NOW_PLAYING))
      }
    }
  }, [dispatchWeb, track])

  const onToggleRepost = useCallback(() => {
    if (track) {
      if (track.has_current_user_reposted) {
        dispatchWeb(undoRepostTrack(track.track_id, RepostSource.NOW_PLAYING))
      } else {
        dispatchWeb(repostTrack(track.track_id, RepostSource.NOW_PLAYING))
      }
    }
  }, [dispatchWeb, track])

  const onPressShare = useCallback(() => {
    if (track) {
      dispatchWeb(
        requestOpenShareModal({
          type: 'track',
          trackId: track.track_id,
          source: ShareSource.NOW_PLAYING
        })
      )
    }
  }, [dispatchWeb, track])

  const onPressOverflow = useCallback(() => {
    if (track) {
      const isOwner = currentUserId === track.owner_id
      const overflowActions = [
        !isOwner
          ? track.has_current_user_reposted
            ? OverflowAction.UNREPOST
            : OverflowAction.REPOST
          : null,
        !isOwner
          ? track.has_current_user_saved
            ? OverflowAction.UNFAVORITE
            : OverflowAction.FAVORITE
          : null,
        OverflowAction.SHARE,
        OverflowAction.ADD_TO_PLAYLIST,
        OverflowAction.VIEW_TRACK_PAGE,
        OverflowAction.VIEW_ARTIST_PAGE
      ].filter(Boolean) as OverflowAction[]

      dispatchWeb(
        openOverflowMenu({
          source: OverflowSource.TRACKS,
          id: track.track_id,
          overflowActions
        })
      )
    }
  }, [track, currentUserId, dispatchWeb])

  const { openAirplayDialog } = useAirplay()
  const { openChromecastDialog } = useChromecast()

  const ColorizedRepostOnIcon = useMemo(
    () =>
      colorize(IconRepostOnLight, {
        // iconRepost Outlines Comp 1.iconRepost Outlines.Group 1.Fill 1
        'assets.0.layers.0.shapes.0.it.3.c.k.0.s': neutral,
        // iconRepost Outlines Comp 1.iconRepost Outlines.Group 1.Fill 1
        'assets.0.layers.0.shapes.0.it.3.c.k.1.s': primary
      }),
    [neutral, primary]
  )

  const ColorizedRepostOffIcon = useMemo(
    () =>
      colorize(IconRepostOffLight, {
        // iconRepost Outlines Comp 2.iconRepost Outlines.Group 1.Fill 1
        'assets.0.layers.0.shapes.0.it.3.c.k.0.s': primary,
        // iconRepost Outlines Comp 2.iconRepost Outlines.Group 1.Fill 1
        'assets.0.layers.0.shapes.0.it.3.c.k.1.s': neutral
      }),
    [neutral, primary]
  )

  const iconRepostJSON = [ColorizedRepostOnIcon, ColorizedRepostOffIcon]

  const ColorizedFavoriteOnIcon = useMemo(
    () =>
      colorize(IconFavoriteOnLight, {
        // icon_Favorites Outlines 2.Group 1.Fill 1
        'layers.0.shapes.0.it.1.c.k.0.s': neutral,
        // icon_Favorites Outlines 2.Group 1.Fill 1
        'layers.0.shapes.0.it.1.c.k.1.s': primary
      }),
    [neutral, primary]
  )

  const ColorizedFavoriteOffIcon = useMemo(
    () =>
      colorize(IconFavoriteOffLight, {
        // icon_Favorites Outlines 2.Group 1.Fill 1
        'layers.0.shapes.0.it.1.c.k.0.s': primary,
        // icon_Favorites Outlines 2.Group 1.Fill 1
        'layers.0.shapes.0.it.1.c.k.1.s': neutral
      }),
    [neutral, primary]
  )

  const iconFavoriteJSON = [ColorizedFavoriteOnIcon, ColorizedFavoriteOffIcon]

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
    return (
      <IconButton
        onPress={openChromecastDialog}
        icon={IconChromecast}
        fill={isCasting ? primary : neutral}
        styles={{ icon: styles.icon, root: styles.button }}
      />
    )
  }
  const renderRepostButton = () => {
    return (
      <AnimatedButton
        haptics
        iconJSON={iconRepostJSON}
        iconIndex={track.has_current_user_reposted ? 1 : 0}
        onPress={onToggleRepost}
        style={styles.button}
        wrapperStyle={styles.animatedIcon}
      />
    )
  }
  const renderFavoriteButton = () => {
    return (
      <AnimatedButton
        haptics
        iconJSON={iconFavoriteJSON}
        iconIndex={track.has_current_user_saved ? 1 : 0}
        onPress={onToggleFavorite}
        style={styles.button}
        wrapperStyle={styles.animatedIcon}
      />
    )
  }
  const renderShareButton = () => {
    return (
      <IconButton
        icon={IconShare}
        styles={{ icon: styles.icon, root: styles.button }}
        onPress={onPressShare}
      />
    )
  }
  const renderOptionsButton = () => {
    return (
      <IconButton
        icon={IconKebabHorizontal}
        styles={{ icon: styles.icon, root: styles.button }}
        onPress={onPressOverflow}
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
