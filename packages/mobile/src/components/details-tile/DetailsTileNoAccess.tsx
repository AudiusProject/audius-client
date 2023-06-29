import type { ReactNode } from 'react'
import { useCallback } from 'react'

import type { PremiumConditions, ID, User } from '@audius/common'
import {
  Chain,
  FollowSource,
  usersSocialActions,
  tippingActions,
  usePremiumConditionsEntity,
  premiumContentSelectors
} from '@audius/common'
import type { ViewStyle } from 'react-native'
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
import { useDrawer } from 'app/hooks/useDrawer'
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
  unlockingFollowGatedSuffix: '!',
  lockedTipGatedPrefix: 'Send ',
  lockedTipGatedSuffix: ' a tip.',
  unlockingTipGatedPrefix: 'Thank you for supporting ',
  unlockingTipGatedSuffix: ' by sending them a tip!'
}

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  root: {
    padding: spacing(4),
    backgroundColor: palette.neutralLight10,
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: spacing(2)
  },
  headerContainer: {
    ...flexRowCentered(),
    marginBottom: spacing(2),
    justifyContent: 'space-between'
  },
  titleContainer: {
    ...flexRowCentered(),
    justifyContent: 'space-between'
  },
  title: {
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
  name: {
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
  iconLockContainer: {
    backgroundColor: palette.neutralLight4,
    paddingHorizontal: spacing(2),
    borderRadius: spacing(10)
  },
  icon: {
    color: palette.white
  },
  mainButton: {
    marginTop: spacing(7),
    backgroundColor: palette.accentBlue
  },
  bottomMargin: {
    marginBottom: spacing(2)
  },
  loadingSpinner: {
    width: spacing(5),
    height: spacing(5)
  }
}))

type NoAccessProps = {
  renderDescription: () => ReactNode
  isUnlocking: boolean
  style?: ViewStyle
}

const DetailsTileNoAccessSection = ({
  renderDescription,
  isUnlocking,
  style
}: NoAccessProps) => {
  const styles = useStyles()
  const staticWhite = useColor('staticWhite')

  if (isUnlocking) {
    return (
      <View style={[styles.root, style]}>
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{messages.unlocking}</Text>
          </View>
          <LoadingSpinner style={styles.loadingSpinner} />
        </View>
        {renderDescription()}
      </View>
    )
  }

  return (
    <View style={[styles.root, style]}>
      <View style={[styles.titleContainer, styles.bottomMargin]}>
        <Text style={styles.title}>{messages.howToUnlock}</Text>
        <View style={styles.iconLockContainer}>
          <IconLock fill={staticWhite} width={14} height={14} />
        </View>
      </View>
      {renderDescription()}
    </View>
  )
}

type DetailsTileNoAccessProps = {
  premiumConditions: PremiumConditions
  trackId: ID
  style?: ViewStyle
}

export const DetailsTileNoAccess = ({
  trackId,
  premiumConditions,
  style
}: DetailsTileNoAccessProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const { isOpen: isModalOpen } = useDrawer('LockedContent')
  const source = isModalOpen ? 'howToUnlockModal' : 'howToUnlockTrackPage'
  const followSource = isModalOpen
    ? FollowSource.HOW_TO_UNLOCK_MODAL
    : FollowSource.HOW_TO_UNLOCK_TRACK_PAGE
  const premiumTrackStatusMap = useSelector(getPremiumTrackStatusMap)
  const premiumTrackStatus = premiumTrackStatusMap[trackId] ?? null
  const { nftCollection, collectionLink, followee, tippedUser } =
    usePremiumConditionsEntity(premiumConditions)

  const { onPress: handlePressCollection } = useLink(collectionLink)

  const handleFollowArtist = useCallback(() => {
    if (followee) {
      dispatch(followUser(followee.user_id, followSource, trackId))
    }
  }, [followee, dispatch, followSource, trackId])

  const handleSendTip = useCallback(() => {
    dispatch(beginTip({ user: tippedUser, source, trackId }))
    navigation.navigate('TipArtist')
  }, [tippedUser, navigation, dispatch, source, trackId])

  const handlePressArtistName = useCallback(
    (handle: string) => () => {
      navigation.push('Profile', { handle })
    },
    [navigation]
  )

  const renderLockedSpecialAccessDescription = useCallback(
    (args: { entity: User; prefix: string; suffix?: string }) => {
      const { entity, prefix, suffix } = args
      return (
        <View style={styles.descriptionContainer}>
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
          {suffix ? <Text style={styles.description}>{suffix}</Text> : null}
        </View>
      )
    },
    [styles, handlePressArtistName]
  )

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
          {renderLockedSpecialAccessDescription({
            entity: followee,
            prefix: messages.lockedFollowGatedPrefix
          })}
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
          {renderLockedSpecialAccessDescription({
            entity: tippedUser,
            prefix: messages.lockedTipGatedPrefix,
            suffix: messages.lockedTipGatedSuffix
          })}
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

    console.warn(
      'No entity for premium conditions... should not have reached here.'
    )
    return null
  }, [
    nftCollection,
    followee,
    tippedUser,
    handlePressCollection,
    renderLockedSpecialAccessDescription,
    handleFollowArtist,
    handleSendTip,
    styles
  ])

  const renderUnlockingSpecialAccessDescription = useCallback(
    (args: { entity: User; prefix: string; suffix: string }) => {
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
              style={[styles.description, styles.name]}
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
      return renderUnlockingSpecialAccessDescription({
        entity: followee,
        prefix: messages.unlockingFollowGatedPrefix,
        suffix: messages.unlockingFollowGatedSuffix
      })
    }
    if (tippedUser) {
      return renderUnlockingSpecialAccessDescription({
        entity: tippedUser,
        prefix: messages.unlockingTipGatedPrefix,
        suffix: messages.unlockingTipGatedSuffix
      })
    }

    console.warn(
      'No entity for premium conditions... should not have reached here.'
    )
    return null
  }, [
    nftCollection,
    followee,
    tippedUser,
    handlePressCollection,
    renderUnlockingSpecialAccessDescription,
    styles
  ])

  const isUnlocking = premiumTrackStatus === 'UNLOCKING'

  return (
    <DetailsTileNoAccessSection
      renderDescription={
        isUnlocking ? renderUnlockingDescription : renderLockedDescription
      }
      isUnlocking={isUnlocking}
      style={style}
    />
  )
}
