import type { ComponentType, ReactNode } from 'react'

import type { User } from '@audius/common'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { Text, View } from 'react-native'
import type { LinearGradientProps } from 'react-native-linear-gradient'

import type { TileProps } from 'app/components/core'
import { Tile } from 'app/components/core'
import UserBadges from 'app/components/user-badges/UserBadges'
import type { StylesProp } from 'app/styles'
import { flexRowCentered, makeStyles } from 'app/styles'

import type { ImageProps } from '../image/FastImage'
import { CollectionDownloadStatusIndicator } from '../offline-downloads/CollectionDownloadStatusIndicator'

export type CardType = 'user' | 'collection'

const useStyles = makeStyles(({ palette, typography, spacing }) => ({
  cardContent: {
    paddingHorizontal: spacing(2)
  },
  cardImage: {
    borderRadius: 6,
    height: 152,
    width: 152,
    marginTop: spacing(2),
    alignSelf: 'center'
  },
  userImage: {
    borderRadius: 152 / 2,
    backgroundColor: '#ddd'
  },
  textContainer: {
    paddingVertical: spacing(1)
  },
  primaryText: {
    ...typography.h3,
    color: palette.neutral,
    textAlign: 'center',
    // needed to keep emojis from increasing text height
    lineHeight: 24,
    height: 24
  },
  secondaryText: {
    ...typography.body2,
    color: palette.neutral,
    marginHorizontal: spacing(1),
    textAlign: 'center'
  },
  secondaryTextContainer: {
    ...flexRowCentered(),
    justifyContent: 'center'
  }
}))

type BaseCardProps = {
  onPress: () => void
  primaryText: string
  renderImage: (options?: ImageProps) => ReactNode
  secondaryText?: string
  TileProps?: Omit<TileProps<ComponentType<LinearGradientProps>>, 'children'>
  style?: StyleProp<ViewStyle>
  styles?: StylesProp<{
    primaryText: TextStyle
    secondaryText: TextStyle
  }>
}

export type ProfileCardProps = BaseCardProps & {
  type: 'user'
  user: User
}
export type CollectionCardProps = BaseCardProps & {
  type: 'collection'
  id: number
}
export type CardProps = ProfileCardProps | CollectionCardProps

export const Card = (props: CardProps) => {
  const {
    onPress,
    primaryText,
    renderImage,
    secondaryText,
    style,
    styles: stylesProp,
    TileProps = {}
  } = props

  const styles = useStyles()

  return (
    <Tile
      onPress={onPress}
      styles={{ root: style, content: styles.cardContent }}
      {...TileProps}
    >
      {renderImage({
        style: [styles.cardImage, props.type === 'user' && styles.userImage]
      })}
      <View style={styles.textContainer}>
        <Text
          numberOfLines={1}
          style={[styles.primaryText, stylesProp?.primaryText]}
        >
          {primaryText}
          {props.type === 'user' ? (
            <UserBadges user={props.user} badgeSize={12} hideName />
          ) : null}
        </Text>
        <View style={styles.secondaryTextContainer}>
          <Text
            numberOfLines={1}
            style={[styles.secondaryText, stylesProp?.secondaryText]}
          >
            {secondaryText}
          </Text>
          {props.type === 'collection' ? (
            <CollectionDownloadStatusIndicator
              size={18}
              collectionId={props.id}
            />
          ) : null}
        </View>
      </View>
    </Tile>
  )
}
