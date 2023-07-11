import { useCallback } from 'react'

import type { PremiumConditions, User } from '@audius/common'
import {
  formatUSDC,
  isPremiumContentCollectibleGated,
  isPremiumContentFollowGated,
  isPremiumContentTipGated,
  isPremiumContentUSDCPurchaseGated,
  usePremiumConditionsEntity
} from '@audius/common'
import type { ViewStyle } from 'react-native'
import { View } from 'react-native'

import IconCart from 'app/assets/images/iconCart.svg'
import IconCollectible from 'app/assets/images/iconCollectible.svg'
import IconSpecialAccess from 'app/assets/images/iconSpecialAccess.svg'
import { useLink, Text, LockedStatusBadge } from 'app/components/core'
import UserBadges from 'app/components/user-badges'
import { useNavigation } from 'app/hooks/useNavigation'
import { flexRowCentered, makeStyles } from 'app/styles'
import { useColor } from 'app/utils/theme'

const messages = {
  unlocked: 'UNLOCKED',
  collectibleGated: 'COLLECTIBLE GATED',
  specialAccess: 'SPECIAL ACCESS',
  USDCPurchaseTitle: 'Pay to Unlock',
  unlockedCollectibleGatedPrefix: 'A Collectible from ',
  unlockedCollectibleGatedSuffix:
    ' was found in a linked wallet. This track is now available.',
  ownerCollectibleGatedPrefix:
    'Users can unlock access by linking a wallet containing a collectible from ',
  unlockedFollowGatedPrefix: 'Thank you for following ',
  unlockedFollowGatedSuffix: '! This track is now available.',
  ownerFollowGated: 'Users can unlock access by following your account!',
  unlockedTipGatedPrefix: 'Thank you for supporting ',
  unlockedTipGatedSuffix:
    ' by sending them a tip! This track is now available.',
  ownerTipGated: 'Users can unlock access by sending you a tip!',
  unlockedUSDCPurchasePrefix:
    'You’ve purchased this track. Thank you for supporting ',
  unlockedUSDCPurchaseSuffix: '.',
  ownerUSDCPurchase: (price: string) =>
    `Users can unlock access to this track for a one time purchase of $${price}`
}

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  root: {
    padding: spacing(4),
    backgroundColor: palette.neutralLight10,
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: spacing(2),
    gap: spacing(2)
  },
  titleContainer: {
    ...flexRowCentered(),
    justifyContent: 'space-between',
    gap: spacing(2)
  },
  ownerTitleContainer: {
    justifyContent: 'flex-start'
  },
  title: {
    fontFamily: typography.fontByWeight.heavy,
    fontSize: typography.fontSize.medium,
    color: palette.neutral,
    textTransform: 'uppercase'
  },
  descriptionContainer: {
    ...flexRowCentered(),
    flexWrap: 'wrap'
  },
  description: {
    flexShrink: 0,
    fontFamily: typography.fontByWeight.demiBold,
    fontSize: typography.fontSize.medium,
    color: palette.neutral,
    lineHeight: typography.fontSize.medium * 1.3
  },
  name: {
    color: palette.secondary
  }
}))

type HasAccessProps = {
  premiumConditions: PremiumConditions
  handlePressCollection: () => void
  style?: ViewStyle
}

const DetailsTileOwnerSection = ({
  premiumConditions,
  handlePressCollection
}: HasAccessProps) => {
  const styles = useStyles()
  const neutral = useColor('neutral')

  if (isPremiumContentCollectibleGated(premiumConditions)) {
    return (
      <View style={styles.root}>
        <View style={[styles.titleContainer, styles.ownerTitleContainer]}>
          <IconCollectible fill={neutral} width={16} height={16} />
          <Text style={styles.title}>{messages.collectibleGated}</Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text>
            <Text style={styles.description}>
              {messages.ownerCollectibleGatedPrefix}
            </Text>
            <Text
              onPress={handlePressCollection}
              style={[styles.description, styles.name]}
            >
              {premiumConditions.nft_collection?.name}
            </Text>
          </Text>
        </View>
      </View>
    )
  }
  if (
    isPremiumContentFollowGated(premiumConditions) ||
    isPremiumContentTipGated(premiumConditions)
  ) {
    return (
      <View style={styles.root}>
        <View style={[styles.titleContainer, styles.ownerTitleContainer]}>
          <IconSpecialAccess fill={neutral} width={16} height={16} />
          <Text style={styles.title}>{messages.specialAccess}</Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text>
            <Text style={styles.description}>
              {isPremiumContentFollowGated(premiumConditions)
                ? messages.ownerFollowGated
                : messages.ownerTipGated}
            </Text>
          </Text>
        </View>
      </View>
    )
  }
  if (isPremiumContentUSDCPurchaseGated(premiumConditions)) {
    return (
      <View style={styles.root}>
        <View style={[styles.titleContainer, styles.ownerTitleContainer]}>
          <IconCart fill={neutral} width={16} height={16} />
          <Text style={styles.title}>{messages.USDCPurchaseTitle}</Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text>
            <Text style={styles.description}>
              {/* TODO convert to new fn */}
              {messages.ownerUSDCPurchase(
                formatUSDC(premiumConditions.usdc_purchase.price)
              )}
            </Text>
          </Text>
        </View>
      </View>
    )
  }
  return null
}

type DetailsTileHasAccessProps = {
  premiumConditions: PremiumConditions
  isOwner: boolean
  style?: ViewStyle
  trackArtist?: Pick<User, 'user_id' | 'name' | 'is_verified' | 'handle'>
}

export const DetailsTileHasAccess = ({
  premiumConditions,
  isOwner,
  style,
  trackArtist
}: DetailsTileHasAccessProps) => {
  const styles = useStyles()
  const navigation = useNavigation()

  const { nftCollection, collectionLink, followee, tippedUser } =
    usePremiumConditionsEntity(premiumConditions)

  const { onPress: handlePressCollection } = useLink(collectionLink)

  const handlePressArtistName = useCallback(
    (handle: string) => () => {
      navigation.push('Profile', { handle })
    },
    [navigation]
  )

  const renderUnlockedSpecialAccessDescription = useCallback(
    (args: {
      entity: Pick<User, 'user_id' | 'name' | 'is_verified' | 'handle'>
      prefix: string
      suffix: string
    }) => {
      const { entity, prefix, suffix } = args
      return (
        <View style={styles.descriptionContainer}>
          <Text>
            <Text style={styles.description}>{prefix}</Text>
            <Text
              style={[styles.description, styles.name]}
              onPress={handlePressArtistName(entity.handle)}
            >
              {entity.name}
            </Text>
            <UserBadges
              badgeSize={16}
              user={entity}
              nameStyle={styles.description}
              hideName
            />
            <Text style={styles.description}>{suffix}</Text>
          </Text>
        </View>
      )
    },
    [styles, handlePressArtistName]
  )

  const renderUnlockedDescription = useCallback(() => {
    if (isPremiumContentCollectibleGated(premiumConditions)) {
      if (!nftCollection) return null
      return (
        <View style={styles.descriptionContainer}>
          <Text>
            <Text style={styles.description}>
              {messages.unlockedCollectibleGatedPrefix}
            </Text>
            <Text
              style={[styles.description, styles.name]}
              onPress={handlePressCollection}
            >
              {nftCollection.name}
            </Text>
            <Text style={styles.description}>
              {messages.unlockedCollectibleGatedSuffix}
            </Text>
          </Text>
        </View>
      )
    }
    if (isPremiumContentFollowGated(premiumConditions)) {
      if (!followee) return null
      return renderUnlockedSpecialAccessDescription({
        entity: followee,
        prefix: messages.unlockedFollowGatedPrefix,
        suffix: messages.unlockedFollowGatedSuffix
      })
    }
    if (isPremiumContentTipGated(premiumConditions)) {
      if (!tippedUser) return null
      return renderUnlockedSpecialAccessDescription({
        entity: tippedUser,
        prefix: messages.unlockedTipGatedPrefix,
        suffix: messages.unlockedTipGatedSuffix
      })
    }
    if (isPremiumContentUSDCPurchaseGated(premiumConditions)) {
      if (!trackArtist) return null
      return renderUnlockedSpecialAccessDescription({
        entity: trackArtist,
        prefix: messages.unlockedUSDCPurchasePrefix,
        suffix: messages.unlockedUSDCPurchaseSuffix
      })
    }
    return null
  }, [
    premiumConditions,
    nftCollection,
    styles.descriptionContainer,
    styles.description,
    styles.name,
    handlePressCollection,
    followee,
    renderUnlockedSpecialAccessDescription,
    tippedUser,
    trackArtist
  ])

  if (isOwner) {
    return (
      <DetailsTileOwnerSection
        premiumConditions={premiumConditions}
        handlePressCollection={handlePressCollection}
      />
    )
  }

  return (
    <View style={[styles.root, style]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{messages.unlocked}</Text>
        <LockedStatusBadge
          locked={false}
          variant={
            isPremiumContentUSDCPurchaseGated(premiumConditions)
              ? 'premium'
              : 'gated'
          }
        />
      </View>
      {renderUnlockedDescription()}
    </View>
  )
}
