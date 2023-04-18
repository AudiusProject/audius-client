import { View } from 'react-native'

import IconKebabHorizontal from 'app/assets/images/iconKebabHorizontal.svg'
import IconShare from 'app/assets/images/iconShare.svg'
import { IconButton } from 'app/components/core'
import { FavoriteButton } from 'app/components/favorite-button'
import { RepostButton } from 'app/components/repost-button'
import { flexRowCentered, makeStyles } from 'app/styles'
import type { GestureResponderHandler } from 'app/types/gesture'
import { useThemeColors } from 'app/utils/theme'

type DetailsTileActionButtonsProps = {
  hasReposted: boolean
  hasSaved: boolean
  isOwner: boolean
  isPublished?: boolean
  hideFavorite?: boolean
  hideOverflow?: boolean
  hideRepost?: boolean
  hideShare?: boolean
  onPressRepost?: GestureResponderHandler
  onPressSave?: GestureResponderHandler
  onPressShare?: GestureResponderHandler
  onPressOverflow?: GestureResponderHandler
}

const useStyles = makeStyles(({ palette }) => ({
  root: {
    ...flexRowCentered(),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.neutralLight7,
    height: 60,
    paddingTop: 12,
    paddingBottom: 8
  },

  actionButton: {
    ...flexRowCentered(),
    width: 30,
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
    bottom: 1,
    marginHorizontal: 16
  }
}))

/**
 * The action buttons on track and playlist screens
 */
export const DetailsTileActionButtons = ({
  hasReposted,
  hasSaved,
  isOwner,
  isPublished = true,
  hideFavorite,
  hideOverflow,
  hideRepost,
  hideShare,
  onPressOverflow,
  onPressRepost,
  onPressSave,
  onPressShare
}: DetailsTileActionButtonsProps) => {
  const styles = useStyles()
  const { neutralLight4 } = useThemeColors()

  const repostButton = (
    <RepostButton
      wrapperStyle={styles.actionButton}
      onPress={onPressRepost}
      isActive={!isOwner && hasReposted}
      isDisabled={isOwner}
    />
  )

  const favoriteButton = (
    <FavoriteButton
      wrapperStyle={styles.actionButton}
      onPress={onPressSave}
      isActive={!isOwner && hasSaved}
      isDisabled={isOwner}
    />
  )

  const shareButton = (
    <IconButton
      fill={neutralLight4}
      icon={IconShare}
      isDisabled={!isPublished}
      onPress={onPressShare}
      styles={{ icon: [styles.actionButton, { height: 24, width: 24 }] }}
    />
  )

  const overflowMenu = (
    <IconButton
      fill={neutralLight4}
      icon={IconKebabHorizontal}
      onPress={onPressOverflow}
      styles={{ icon: styles.actionButton }}
    />
  )

  return (
    <View style={styles.root}>
      {hideRepost ? null : repostButton}
      {hideFavorite ? null : favoriteButton}
      {hideShare ? null : shareButton}
      {hideOverflow ? null : overflowMenu}
    </View>
  )
}
