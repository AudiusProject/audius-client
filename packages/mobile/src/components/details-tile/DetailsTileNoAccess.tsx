import type { ReactNode } from 'react'
import { useMemo, useCallback } from 'react'

import type { PremiumConditions, ID } from '@audius/common'
import {
  FollowSource,
  usersSocialActions,
  tippingActions,
  Chain,
  useSpecialAccessEntity,
  premiumContentSelectors
} from '@audius/common'
import { View, Text, Image } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconExternalLink from 'app/assets/images/iconExternalLink.svg'
import IconFollow from 'app/assets/images/iconFollow.svg'
import IconLock from 'app/assets/images/iconLock.svg'
import IconTip from 'app/assets/images/iconTip.svg'
import LogoEth from 'app/assets/images/logoEth.svg'
import LogoSol from 'app/assets/images/logoSol.svg'
import { Button, useLink } from 'app/components/core'
import LoadingSpinner from 'app/components/loading-spinner'
import UserBadges from 'app/components/user-badges'
import { useNavigation } from 'app/hooks/useNavigation'
import { flexRowCentered, makeStyles } from 'app/styles'
import { useColor } from 'app/utils/theme'

const { getPremiumTrackStatusMap } = premiumContentSelectors
const { followUser } = usersSocialActions
const { beginTip } = tippingActions

const messages = {
  unlocking: 'UNLOCKING',
  howToUnlock: 'HOW TO UNLOCK',
  goToCollection: 'Go To Collection',
  followArtist: 'Follow Artist',
  sendTip: 'Send Tip',
  lockedCollectibleGated:
    'To unlock this track, you must link a wallet containing a collectible from:',
  unlockingCollectibleGatedPrefix: 'A Collectible from ',
  unlockingCollectibleGatedSuffix: ' was found in a linked wallet.',
  lockedFollowGatedPrefix: 'Follow ',
  unlockingFollowGatedPrefix: 'Thank you for following ',
  unlockingFollowGatedSuffix: ' !',
  lockedTipGatedPrefix: 'Send ',
  lockedTipGatedSuffix: ' a tip.',
  unlockingTipGatedPrefix: 'Thank you for supporting ',
  unlockingTipGatedSuffix: ' by sending them a tip!'
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
  collectionName: {
    color: palette.secondary
  },
  collectionContainer: {
    ...flexRowCentered(),
    marginTop: spacing(2)
  },
  collectionImages: {
    ...flexRowCentered(),
    marginRight: spacing(6)
  },
  collectionImage: {
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: spacing(1),
    width: spacing(8),
    height: spacing(8)
  },
  collectionChainImageContainer: {
    backgroundColor: palette.white,
    position: 'absolute',
    left: spacing(6),
    padding: spacing(1),
    width: spacing(6),
    height: spacing(6),
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: 16
  },
  collectionChainImage: {
    top: -spacing(0.25),
    left: -spacing(1.25)
  },
  icon: {
    color: palette.white
  },
  mainButton: {
    marginTop: spacing(7)
  }
}))

type NoAccessProps = {
  renderDescription: () => ReactNode
  isUnlocking: boolean
}

const DetailsTileNoAccessSection = ({
  renderDescription,
  isUnlocking
}: NoAccessProps) => {
  const styles = useStyles()
  const neutral = useColor('neutral')

  if (isUnlocking) {
    return (
      <View style={styles.root}>
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <IconLock fill={neutral} width={16} height={16} />
            <Text style={styles.title}>{messages.unlocking}</Text>
          </View>
          <LoadingSpinner />
        </View>
        {renderDescription()}
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.titleContainer}>
        <IconLock fill={neutral} width={16} height={16} />
        <Text style={styles.title}>{messages.howToUnlock}</Text>
      </View>
      {renderDescription()}
    </View>
  )
}

type DetailsTileNoAccessProps = {
  premiumConditions: PremiumConditions
  trackId: ID
}

export const DetailsTileNoAccess = ({
  trackId,
  premiumConditions
}: DetailsTileNoAccessProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const premiumTrackStatusMap = useSelector(getPremiumTrackStatusMap)
  const premiumTrackStatus = premiumTrackStatusMap[trackId] ?? null
  const { nftCollection, followee, tippedUser } =
    useSpecialAccessEntity(premiumConditions)

  const collectionLink = useMemo(() => {
    if (!nftCollection) return ''

    const { chain, address, externalLink } = nftCollection
    if (chain === Chain.Eth && 'slug' in nftCollection!) {
      return `https://opensea.io/collection/${nftCollection.slug}`
    } else if (chain === Chain.Sol) {
      const explorerUrl = `https://explorer.solana.com/address/${address}`
      return externalLink ? new URL(externalLink).hostname : explorerUrl
    }

    return ''
  }, [nftCollection])

  const { onPress: handlePressCollection } = useLink(collectionLink)

  const handleFollowArtist = useCallback(() => {
    if (followee) {
      dispatch(followUser(followee.user_id, FollowSource.TRACK_PAGE))
    }
  }, [followee, dispatch])

  const handleSendTip = useCallback(() => {
    dispatch(beginTip({ user: tippedUser, source: 'trackPage' }))
    navigation.navigate('TipArtist')
  }, [tippedUser, navigation, dispatch])

  const renderLockedDescription = useCallback(() => {
    if (nftCollection) {
      return (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            {messages.lockedCollectibleGated}
          </Text>
          <View style={styles.collectionContainer}>
            {nftCollection.imageUrl && (
              <View style={styles.collectionImages}>
                <Image
                  source={{ uri: nftCollection.imageUrl }}
                  style={styles.collectionImage}
                />
                <View style={styles.collectionChainImageContainer}>
                  {nftCollection.chain === Chain.Eth ? (
                    <LogoEth style={styles.collectionChainImage} height={16} />
                  ) : (
                    <LogoSol style={styles.collectionChainImage} height={16} />
                  )}
                </View>
              </View>
            )}
            <Text style={styles.description}>{nftCollection.name}</Text>
          </View>
          <Button
            style={styles.mainButton}
            styles={{ icon: { width: 16, height: 16 } }}
            title={messages.goToCollection}
            size='large'
            iconPosition='right'
            icon={IconExternalLink}
            onPress={handlePressCollection}
            fullWidth
          />
        </View>
      )
    }
    if (followee) {
      return (
        <View>
          <Text style={styles.descriptionContainer}>
            <Text style={styles.description}>
              {messages.lockedFollowGatedPrefix}
            </Text>
            <Text style={styles.description}>{followee.name}</Text>
            <UserBadges
              badgeSize={16}
              user={followee}
              nameStyle={styles.description}
              hideName
            />
          </Text>
          <Button
            style={styles.mainButton}
            styles={{ icon: { width: 16, height: 16 } }}
            title={messages.followArtist}
            size='large'
            iconPosition='left'
            icon={IconFollow}
            onPress={handleFollowArtist}
            fullWidth
          />
        </View>
      )
    }
    if (tippedUser) {
      return (
        <View style={styles.descriptionContainer}>
          <Text>
            <Text style={styles.description}>
              {messages.lockedTipGatedPrefix}
            </Text>
            <Text style={styles.description}>{tippedUser.name}</Text>
            <UserBadges
              badgeSize={16}
              user={tippedUser}
              nameStyle={styles.description}
              hideName
            />
            <Text style={styles.description}>
              {messages.lockedTipGatedSuffix}
            </Text>
          </Text>
          <Button
            style={styles.mainButton}
            styles={{ icon: { width: 16, height: 16 } }}
            title={messages.sendTip}
            size='large'
            iconPosition='right'
            icon={IconTip}
            onPress={handleSendTip}
            fullWidth
          />
        </View>
      )
    }

    // should not reach here
    return null
  }, [
    nftCollection,
    followee,
    tippedUser,
    handlePressCollection,
    handleFollowArtist,
    handleSendTip,
    styles
  ])

  const renderUnlockingDescription = useCallback(() => {
    if (nftCollection) {
      return (
        <View style={styles.descriptionContainer}>
          <Text>
            <Text style={styles.description}>
              {messages.unlockingCollectibleGatedPrefix}
            </Text>
            <Text
              onPress={handlePressCollection}
              style={[styles.description, styles.collectionName]}
            >
              {nftCollection.name}
            </Text>
            <Text style={styles.description}>
              {messages.unlockingCollectibleGatedSuffix}
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
              {messages.unlockingFollowGatedPrefix}
            </Text>
            <Text style={styles.description}>{followee.name}</Text>
            <UserBadges
              badgeSize={16}
              user={followee}
              nameStyle={styles.description}
              hideName
            />
            <Text style={styles.description}>
              {messages.unlockingFollowGatedSuffix}
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
              {messages.unlockingTipGatedPrefix}
            </Text>
            <Text style={styles.description}>{tippedUser.name}</Text>
            <UserBadges
              badgeSize={16}
              user={tippedUser}
              nameStyle={styles.description}
              hideName
            />
            <Text style={styles.description}>
              {messages.unlockingTipGatedSuffix}
            </Text>
          </Text>
        </View>
      )
    }

    // should not reach here
    return null
  }, [nftCollection, followee, tippedUser, handlePressCollection, styles])

  const isUnlocking = premiumTrackStatus === 'UNLOCKING'

  return (
    <DetailsTileNoAccessSection
      renderDescription={
        isUnlocking ? renderUnlockingDescription : renderLockedDescription
      }
      isUnlocking={isUnlocking}
    />
  )
}
