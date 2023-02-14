import type { ReactNode } from 'react'
import { useCallback } from 'react'

import type {
  Nullable,
  PremiumConditions,
  PremiumConditionsEthNFTCollection,
  PremiumConditionsSolNFTCollection,
  User
} from '@audius/common'
import { useSpecialAccessEntity } from '@audius/common'
import { View, Text } from 'react-native'

import IconCollectible from 'app/assets/images/iconCollectible.svg'
import IconSpecialAccess from 'app/assets/images/iconSpecialAccess.svg'
import IconUnlocked from 'app/assets/images/iconUnlocked.svg'
import IconVerifiedGreen from 'app/assets/images/iconVerifiedGreen.svg'
import { useLink } from 'app/components/core'
import UserBadges from 'app/components/user-badges'
import { flexRowCentered, makeStyles } from 'app/styles'
import { useColor } from 'app/utils/theme'

const messages = {
  unlocked: 'UNLOCKED',
  collectibleGated: 'COLLECTIBLE GATED',
  specialAccess: 'SPECIAL ACCESS',
  unlockedCollectibleGatedPrefix: 'A Collectible from ',
  unlockedCollectibleGatedSuffix:
    ' was found in a linked wallet. This track is now available.',
  ownerCollectibleGatedPrefix:
    'Users can unlock access by linking a wallet containing a collectible from ',
  unlockedFollowGatedPrefix: 'Thank you for following ',
  unlockedFollowGatedSuffix: ' ! This track is now available.',
  ownerFollowGated: 'Users can unlock access by following your account!',
  unlockedTipGatedPrefix: 'Thank you for supporting ',
  unlockedTipGatedSuffix:
    ' by sending them a tip!  This track is now available.',
  ownerTipGated: 'Users can unlock access by sending you a tip! '
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
  },
  collectionName: {
    color: palette.secondary
  }
}))

type HasAccessProps = {
  renderDescription: () => ReactNode
  nftCollection?: Nullable<
    PremiumConditionsEthNFTCollection | PremiumConditionsSolNFTCollection
  >
  followee?: Nullable<User>
  tippedUser?: Nullable<User>
}

const DetailsTileUnlockedSection = ({ renderDescription }: HasAccessProps) => {
  const styles = useStyles()
  const neutral = useColor('neutral')

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
  renderDescription,
  nftCollection,
  followee,
  tippedUser
}: HasAccessProps) => {
  const styles = useStyles()
  const neutral = useColor('neutral')

  return (
    <View style={styles.root}>
      <View style={styles.titleContainer}>
        {nftCollection && (
          <IconCollectible fill={neutral} width={16} height={16} />
        )}
        {(followee || tippedUser) && (
          <IconSpecialAccess fill={neutral} width={16} height={16} />
        )}
        <Text style={styles.title}>
          {nftCollection ? messages.collectibleGated : messages.specialAccess}
        </Text>
      </View>
      {renderDescription()}
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
  const styles = useStyles()

  const { nftCollection, collectionLink, followee, tippedUser } =
    useSpecialAccessEntity(premiumConditions)

  const { onPress: handlePressCollection } = useLink(collectionLink)

  const renderOwnerDescription = useCallback(() => {
    if (nftCollection) {
      return (
        <View style={styles.descriptionContainer}>
          <Text>
            <Text style={styles.description}>
              {messages.ownerCollectibleGatedPrefix}
            </Text>
            <Text
              onPress={handlePressCollection}
              style={[styles.description, styles.collectionName]}
            >
              {nftCollection.name}
            </Text>
          </Text>
        </View>
      )
    }
    if (followee) {
      return (
        <View style={styles.descriptionContainer}>
          <Text>
            <Text style={styles.description}>{messages.ownerFollowGated}</Text>
          </Text>
        </View>
      )
    }
    if (tippedUser) {
      return (
        <View style={styles.descriptionContainer}>
          <Text>
            <Text style={styles.description}>{messages.ownerTipGated}</Text>
          </Text>
        </View>
      )
    }

    console.warn(
      'No entity for premium conditions... should not have reached here.'
    )
    return null
  }, [nftCollection, followee, tippedUser, handlePressCollection, styles])

  const renderUnlockedDescription = useCallback(() => {
    if (nftCollection) {
      return (
        <View style={styles.descriptionContainer}>
          <Text>
            <Text style={styles.description}>
              {messages.unlockedCollectibleGatedPrefix}
            </Text>
            <Text
              onPress={handlePressCollection}
              style={[styles.description, styles.collectionName]}
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
    if (followee) {
      return (
        <View style={styles.descriptionContainer}>
          <Text>
            <Text style={styles.description}>
              {messages.unlockedFollowGatedPrefix}
            </Text>
            <Text style={styles.description}>{followee.name}</Text>
            <UserBadges
              badgeSize={16}
              user={followee}
              nameStyle={styles.description}
              hideName
            />
            <Text style={styles.description}>
              {messages.unlockedFollowGatedSuffix}
            </Text>
          </Text>
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

    console.warn(
      'No entity for premium conditions... should not have reached here.'
    )
    return null
  }, [nftCollection, followee, tippedUser, handlePressCollection, styles])

  if (isOwner) {
    return (
      <DetailsTileOwnerSection
        nftCollection={nftCollection}
        followee={followee}
        tippedUser={tippedUser}
        renderDescription={renderOwnerDescription}
      />
    )
  }

  return (
    <DetailsTileUnlockedSection renderDescription={renderUnlockedDescription} />
  )
}
