import { useCallback } from 'react'

import type { PremiumConditions } from '@audius/common'
import { useSpecialAccessEntity } from '@audius/common'
import { View, Text } from 'react-native'

import IconUnlocked from 'app/assets/images/iconUnlocked.svg'
import IconVerifiedGreen from 'app/assets/images/iconVerifiedGreen.svg'
import UserBadges from 'app/components/user-badges'
import { flexRowCentered, makeStyles } from 'app/styles'
import { useColor } from 'app/utils/theme'

const messages = {
  unlocked: 'UNLOCKED',
  unlockedCollectibleGatedPrefix: 'A Collectible from ',
  unlockedCollectibleGatedSuffix:
    ' was found in a linked wallet. This track is now available.',
  ownerCollectibleGatedPrefix:
    'Users can unlock access by linking a wallet containing a collectible from ',
  unlockedFollowGatedPrefix: 'Thank you for following ',
  unlockedFollowGatedSuffix: ' ! This track is now available.',
  ownerFollowGatedPrefix: 'Users can unlock access by following your account!',
  unlockedTipGatedPrefix: 'Thank you for supporting ',
  unlockedTipGatedSuffix:
    ' by sending them a tip!  This track is now available.',
  ownerTipGatedPrefix: 'Users can unlock access by sending you a tip! '
}

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  root: {
    marginBottom: spacing(4),
    padding: spacing(4),
    backgroundColor: palette.neutralLight10,
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: spacing(2)
  },
  headerContainer: {
    ...flexRowCentered(),
    justifyContent: 'space-between'
  },
  titleContainer: {
    ...flexRowCentered(),
    marginBottom: spacing(2)
  },
  title: {
    marginLeft: spacing(2),
    fontFamily: typography.fontByWeight.heavy,
    fontSize: typography.fontSize.medium,
    color: palette.neutral
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
    lineHeight: spacing(6)
  },
  checkIcon: {
    width: spacing(6),
    height: spacing(6)
  }
}))

const DetailsTileUnlockedSection = ({
  premiumConditions
}: {
  premiumConditions: PremiumConditions
}) => {
  const styles = useStyles()
  const neutral = useColor('neutral')
  const { followee, tippedUser } = useSpecialAccessEntity(premiumConditions)
  console.log('premiumConditions is', premiumConditions, followee, tippedUser)

  const renderDescription = useCallback(() => {
    if (premiumConditions.nft_collection) {
      return (
        <View>
          <Text style={styles.description}>yolo</Text>
        </View>
      )
    }
    if (followee) {
      return (
        <View>
          <Text style={styles.description}>yolo</Text>
        </View>
      )
    }
    if (tippedUser) {
      return (
        <View style={styles.descriptionContainer}>
          <Text>
            <Text style={styles.description}>
              {messages.unlockedTipGatedPrefix}
            </Text>
            <Text style={styles.description}>{tippedUser.name}</Text>
            <UserBadges
              badgeSize={16}
              user={tippedUser}
              nameStyle={styles.description}
              hideName
            />
            <Text style={styles.description}>
              {messages.unlockedTipGatedSuffix}
            </Text>
          </Text>
        </View>
      )
    }

    // should not reach here
    return null
  }, [premiumConditions, followee, tippedUser, styles])

  return (
    <View style={styles.root}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <IconUnlocked fill={neutral} />
          <Text style={styles.title}>{messages.unlocked}</Text>
        </View>
        <IconVerifiedGreen style={styles.checkIcon} />
      </View>
      {renderDescription()}
    </View>
  )
}

const DetailsTileOwnerSection = ({
  premiumConditions
}: {
  premiumConditions: PremiumConditions
}) => {
  return (
    <View>
      <Text>hi</Text>
    </View>
  )
}

type DetailsTilePremiumAccessProps = {
  premiumConditions: PremiumConditions
  isOwner: boolean
}

export const DetailsTileHasAccess = ({
  premiumConditions,
  isOwner
}: DetailsTilePremiumAccessProps) => {
  if (isOwner) {
    return <DetailsTileOwnerSection premiumConditions={premiumConditions} />
  }

  return <DetailsTileUnlockedSection premiumConditions={premiumConditions} />
}
