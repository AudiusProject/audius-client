import { memo, useCallback, useMemo, useState } from 'react'

import type { ID, Track, UID, User } from '@audius/common'
import {
  removeNullable,
  OverflowAction,
  OverflowSource,
  mobileOverflowMenuUIActions,
  cacheUsersSelectors,
  cacheTracksSelectors,
  playerSelectors
} from '@audius/common'
import type { NativeSyntheticEvent, NativeTouchEvent } from 'react-native'
import { Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconDrag from 'app/assets/images/iconDrag.svg'
import IconHeart from 'app/assets/images/iconHeart.svg'
import IconKebabHorizontal from 'app/assets/images/iconKebabHorizontal.svg'
import IconRemoveTrack from 'app/assets/images/iconRemoveTrack.svg'
import { IconButton } from 'app/components/core'
import UserBadges from 'app/components/user-badges'
import { useIsGatedContentEnabled } from 'app/hooks/useIsGatedContentEnabled'
import { font, makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { TrackDownloadStatusIndicator } from '../offline-downloads/TrackDownloadStatusIndicator'

import { TablePlayButton } from './TablePlayButton'
import { TrackArtwork } from './TrackArtwork'
const { open: openOverflowMenu } = mobileOverflowMenuUIActions

const { getUserFromTrack } = cacheUsersSelectors
const { getTrack } = cacheTracksSelectors
const { getPlaying, getUid } = playerSelectors

export type TrackItemAction = 'save' | 'overflow' | 'remove'

const useStyles = makeStyles(({ palette, spacing }) => ({
  trackContainer: {
    width: '100%',
    height: 72,
    backgroundColor: palette.white
  },
  trackContainerActive: {
    backgroundColor: palette.neutralLight9
  },
  trackContainerDisabled: {
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
    flexShrink: 1,
    flexBasis: '100%',
    height: '100%',
    justifyContent: 'center'
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  trackTitle: {
    flexDirection: 'row',
    flexShrink: 1,
    alignItems: 'center',
    textAlignVertical: 'top'
  },
  trackTitleText: {
    ...font('demiBold'),
    lineHeight: 16,
    paddingTop: 2,
    color: palette.neutral
  },
  downloadIndicator: {
    marginLeft: spacing(1)
  },
  artistName: {
    ...font('medium'),
    color: palette.neutralLight2,
    alignItems: 'center'
  },
  iconContainer: {
    marginLeft: spacing(2)
  },
  icon: { height: 16, width: 16 },
  removeIcon: { height: 20, width: 20 },

  playButtonContainer: {
    marginRight: spacing(4)
  },
  dragIcon: {
    marginRight: spacing(6)
  },
  divider: {
    borderBottomColor: palette.neutralLight7,
    borderBottomWidth: 1,
    marginVertical: 0,
    marginHorizontal: spacing(6)
  },
  noMarginDivider: {
    borderBottomColor: palette.neutralLight8,
    marginHorizontal: 0
  },
  hideDivider: {
    opacity: 0
  }
}))

const getMessages = ({ isDeleted = false }: { isDeleted?: boolean } = {}) => ({
  deleted: isDeleted ? ' [Deleted By Artist]' : ''
})

export type TrackListItemProps = {
  drag?: () => void
  hideArt?: boolean
  id?: ID
  index: number
  isReorderable?: boolean
  noDividerMargin?: boolean
  onRemove?: (index: number) => void
  onSave?: (isSaved: boolean, trackId: ID) => void
  prevUid?: UID
  showDivider?: boolean
  showTopDivider?: boolean
  togglePlay?: (uid: string, trackId: ID) => void
  trackItemAction?: TrackItemAction
  uid?: UID
}

// Using `memo` because FlatList renders these items
// And we want to avoid a full render when the props haven't changed
export const TrackListItem = memo((props: TrackListItemProps) => {
  const { id, uid } = props

  const track = useSelector((state) => getTrack(state, { id, uid }))
  const user = useSelector((state) => getUserFromTrack(state, { id, uid }))

  if (!track || !user) {
    console.warn('Track or user missing for TrackListItem, preventing render')
    return null
  }

  return <TrackListItemComponent {...props} track={track} user={user} />
})

type TrackListItemComponentProps = TrackListItemProps & {
  track: Track
  user: User
}

const TrackListItemComponent = (props: TrackListItemComponentProps) => {
  const isGatedContentEnabled = useIsGatedContentEnabled()
  const {
    drag,
    hideArt,
    index,
    isReorderable = false,
    noDividerMargin,
    onRemove,
    onSave,
    prevUid,
    showDivider,
    showTopDivider,
    togglePlay,
    track,
    trackItemAction,
    uid,
    user
  } = props

  const {
    has_current_user_saved,
    is_delete,
    is_unlisted,
    title,
    track_id,
    is_premium: isPremium
  } = track
  const { is_deactivated, name } = user

  const isDeleted = is_delete || !!is_deactivated || is_unlisted

  const isActive = useSelector((state) => {
    const playingUid = getUid(state)
    return uid !== undefined && uid === playingUid
  })

  const isPrevItemActive = useSelector((state) => {
    const playingUid = getUid(state)
    return prevUid !== undefined && prevUid === playingUid
  })

  const isPlaying = useSelector((state) => {
    return isActive && getPlaying(state)
  })

  const messages = getMessages({ isDeleted })
  const styles = useStyles()
  const dispatch = useDispatch()
  const themeColors = useThemeColors()
  const [titleWidth, setTitleWidth] = useState(0)

  const deletedTextWidth = useMemo(
    () => (messages.deleted.length ? 124 : 0),
    [messages]
  )
  const titleMaxWidth = useMemo(
    () =>
      titleWidth && deletedTextWidth ? titleWidth - deletedTextWidth : '100%',
    [deletedTextWidth, titleWidth]
  )

  const onPressTrack = () => {
    if (uid && !isDeleted && togglePlay) {
      togglePlay(uid, track_id)
    }
  }

  const handleOpenOverflowMenu = useCallback(() => {
    const overflowActions = [
      !isGatedContentEnabled || !isPremium
        ? OverflowAction.ADD_TO_PLAYLIST
        : null,
      OverflowAction.VIEW_TRACK_PAGE,
      OverflowAction.VIEW_ARTIST_PAGE
    ].filter(removeNullable)

    dispatch(
      openOverflowMenu({
        source: OverflowSource.TRACKS,
        id: track_id,
        overflowActions
      })
    )
  }, [dispatch, isGatedContentEnabled, isPremium, track_id])

  const handlePressSave = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    e.stopPropagation()
    const isNotAvailable = isDeleted && !has_current_user_saved
    if (!isNotAvailable && onSave) {
      onSave(has_current_user_saved, track_id)
    }
  }

  const handlePressOverflow = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    e.stopPropagation()
    handleOpenOverflowMenu()
  }

  const handlePressRemove = () => {
    onRemove?.(index)
  }

  // The dividers above and belove the active track should be hidden
  const hideDivider = isActive || isPrevItemActive

  return (
    <View>
      {showDivider && (showTopDivider || index > 0) ? (
        <View
          style={[
            styles.divider,
            hideDivider && styles.hideDivider,
            noDividerMargin && styles.noMarginDivider
          ]}
        />
      ) : null}
      <View
        style={[
          styles.trackContainer,
          isActive && styles.trackContainerActive,
          isDeleted && styles.trackContainerDisabled
        ]}
      >
        <TouchableOpacity
          style={styles.trackInnerContainer}
          onPress={onPressTrack}
          onLongPress={drag}
          disabled={isDeleted}
        >
          {!hideArt ? (
            <TrackArtwork
              track={track as Track}
              isActive={isActive}
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
          {isReorderable && <IconDrag style={styles.dragIcon} />}
          <View style={styles.nameArtistContainer}>
            <View
              style={styles.topLine}
              onLayout={(e) => setTitleWidth(e.nativeEvent.layout.width)}
            >
              <View style={styles.trackTitle}>
                <Text
                  numberOfLines={1}
                  style={[styles.trackTitleText, { maxWidth: titleMaxWidth }]}
                >
                  {title}
                </Text>
                <Text numberOfLines={1} style={[styles.trackTitleText]}>
                  {messages.deleted}
                </Text>
              </View>

              {!isDeleted && (
                <View style={styles.downloadIndicator}>
                  <TrackDownloadStatusIndicator trackId={track_id} size={16} />
                </View>
              )}
            </View>
            <Text numberOfLines={1} style={styles.artistName}>
              {name}
              <UserBadges user={user} badgeSize={12} hideName />
            </Text>
          </View>
          {trackItemAction === 'save' ? (
            <IconButton
              icon={IconHeart}
              styles={{
                root: styles.iconContainer,
                icon: styles.icon
              }}
              fill={
                has_current_user_saved
                  ? themeColors.primary
                  : themeColors.neutralLight4
              }
              onPress={handlePressSave}
            />
          ) : null}
          {trackItemAction === 'overflow' ? (
            <IconButton
              icon={IconKebabHorizontal}
              styles={{
                root: styles.iconContainer,
                icon: styles.icon
              }}
              onPress={handlePressOverflow}
            />
          ) : null}
          {trackItemAction === 'remove' ? (
            <IconButton
              icon={IconRemoveTrack}
              styles={{
                root: styles.iconContainer,
                icon: styles.removeIcon
              }}
              onPress={handlePressRemove}
            />
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  )
}
