import { useCallback } from 'react'

import { ID } from 'audius-client/src/common/models/Identifiers'
import { getUserId } from 'audius-client/src/common/store/account/selectors'
import {
  OverflowAction,
  OverflowSource
} from 'audius-client/src/common/store/ui/mobile-overflow-menu/types'
import { open as openOverflowMenu } from 'common/store/ui/mobile-overflow-menu/slice'
import {
  NativeSyntheticEvent,
  NativeTouchEvent,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import IconHeart from 'app/assets/images/iconHeart.svg'
import IconKebabHorizontal from 'app/assets/images/iconKebabHorizontal.svg'
import { IconButton } from 'app/components/core'
import UserBadges from 'app/components/user-badges'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { font, makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { TablePlayButton } from './TablePlayButton'
import { TrackArtwork } from './TrackArtwork'
import { TrackMetadata } from './types'

export type TrackItemAction = 'save' | 'overflow'

const useStyles = makeStyles(({ palette, spacing }) => ({
  trackContainer: {
    width: '100%',
    height: 72,
    backgroundColor: palette.white
  },
  trackContainerActive: {
    backgroundColor: palette.neutralLight9
  },
  trackInnerContainer: {
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(6)
  },
  nameArtistContainer: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    height: '100%'
  },
  trackTitle: {
    ...font('demiBold'),
    color: palette.neutral
  },
  artistName: {
    ...font('medium'),
    color: palette.neutralLight2,
    alignItems: 'center'
  },
  iconContainer: {
    marginLeft: spacing(2)
  },
  playButtonContainer: {
    marginRight: spacing(4)
  }
}))

const getMessages = ({ isDeleted = false }: { isDeleted?: boolean } = {}) => ({
  deleted: isDeleted ? ' [Deleted By Artist]' : ''
})

export type TrackListItemProps = {
  hideArt?: boolean
  isActive?: boolean
  isDragging?: boolean
  isLoading?: boolean
  isPlaying?: boolean
  isRemoveActive?: boolean
  isReorderable?: boolean
  onRemove?: (trackId: ID) => void
  onSave?: (isSaved: boolean, trackId: ID) => void
  togglePlay?: (uid: string, trackId: ID) => void
  track: TrackMetadata
  trackItemAction?: TrackItemAction
}

export const TrackListItem = ({
  hideArt,
  isActive,
  isDragging = false,
  isRemoveActive = false,
  isReorderable = false,
  isLoading = false,
  isPlaying = false,
  onRemove,
  onSave,
  togglePlay,
  track,
  trackItemAction
}: TrackListItemProps) => {
  const {
    _cover_art_sizes,
    has_current_user_reposted,
    has_current_user_saved,
    is_delete,
    title,
    track_id,
    uid,
    user: { name, is_deactivated, user_id }
  } = track
  const isDeleted = is_delete || !!is_deactivated

  const messages = getMessages({ isDeleted })
  const styles = useStyles()
  const dispatchWeb = useDispatchWeb()
  const themeColors = useThemeColors()
  const currentUserId = useSelectorWeb(getUserId)

  const onPressTrack = () => {
    if (uid && !isDeleted && togglePlay) {
      togglePlay(uid, track_id)
    }
  }

  const handleOpenOverflowMenu = useCallback(() => {
    const isOwner = currentUserId === user_id

    const overflowActions = [
      !isOwner
        ? has_current_user_reposted
          ? OverflowAction.UNREPOST
          : OverflowAction.REPOST
        : null,
      !isOwner
        ? has_current_user_saved
          ? OverflowAction.UNFAVORITE
          : OverflowAction.FAVORITE
        : null,
      OverflowAction.ADD_TO_PLAYLIST,
      OverflowAction.VIEW_TRACK_PAGE,
      OverflowAction.VIEW_ARTIST_PAGE
    ].filter(Boolean) as OverflowAction[]

    dispatchWeb(
      openOverflowMenu({
        source: OverflowSource.TRACKS,
        id: track_id,
        overflowActions
      })
    )
  }, [
    currentUserId,
    user_id,
    has_current_user_reposted,
    has_current_user_saved,
    dispatchWeb,
    track_id
  ])

  const handleSaveTrack = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    e.stopPropagation()
    const isNotAvailable = isDeleted && !has_current_user_saved
    if (!isNotAvailable && onSave) {
      onSave(has_current_user_saved, track_id)
    }
  }

  const handleClickOverflow = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    e.stopPropagation()
    handleOpenOverflowMenu()
  }

  const tileIconStyles = {
    root: { marginLeft: 8 },
    icon: { height: 16, width: 16 }
  }

  return (
    <View
      style={[
        styles.trackContainer,
        isActive ? styles.trackContainerActive : {}
      ]}
    >
      <TouchableOpacity
        style={styles.trackInnerContainer}
        onPress={onPressTrack}
      >
        {!hideArt ? (
          <TrackArtwork
            trackId={track_id}
            coverArtSizes={_cover_art_sizes}
            isActive={isActive}
            isLoading={isLoading}
            isPlaying={isPlaying}
          />
        ) : isActive && !isDeleted ? (
          <View style={styles.playButtonContainer}>
            <TablePlayButton
              playing
              paused={!isPlaying}
              hideDefault={false}
              onPress={onPressTrack}
            />
          </View>
        ) : null}
        <View style={styles.nameArtistContainer}>
          <Text numberOfLines={1} style={styles.trackTitle}>
            {title}
            {messages.deleted}
          </Text>
          <Text numberOfLines={1} style={styles.artistName}>
            {name}
            <UserBadges user={track.user} badgeSize={12} hideName />
          </Text>
        </View>
        {trackItemAction === 'save' ? (
          <IconButton
            icon={IconHeart}
            styles={tileIconStyles}
            fill={
              has_current_user_saved
                ? themeColors.primary
                : themeColors.neutralLight4
            }
            onPress={handleSaveTrack}
          />
        ) : null}
        {trackItemAction === 'overflow' ? (
          <IconButton
            icon={IconKebabHorizontal}
            styles={tileIconStyles}
            onPress={handleClickOverflow}
          />
        ) : null}
      </TouchableOpacity>
    </View>
  )
}
