import { FeatureFlags, PremiumConditions, cacheUsersSelectors, User, ID } from '@audius/common'
import { Button, ButtonType, IconLock } from '@audius/stems'
import cn from 'classnames'
import FollowButton from 'components/follow-button/FollowButton'
import { IconTip } from 'components/notification/Notification/components/icons'
import UserBadges from 'components/user-badges/UserBadges'
import { useFlag } from 'hooks/useRemoteConfig'
import { useCallback } from 'react'
import { ReactComponent as IconExternalLink } from 'assets/img/iconExternalLink.svg'

import styles from './GiantTrackTile.module.css'
import { useSelector } from 'react-redux'
import { AppState } from 'store/types'

const { getUsers } = cacheUsersSelectors

const messages = {
  howToUnlock: 'HOW TO UNLOCK',
  unlockCollectibleGatedTrack: 'To unlock this track, you must link a wallet containing a collectible from:',
  unlockedCollectibleTrackPrefix: 'A Collectible from ',
  unlockedCollectibleTrackSuffix: ' was found in a linked wallet. This track is now available.',
  goToCollection: 'Go To Collection',
  sendTip: 'Send Tip',
  followArtist: 'Follow Artist',
  unlockFollowGatedTrackPrefix: 'Follow ',
  unlockedFollowGatedTrackPrefix: 'Thank you for following ',
  unlockTipGatedTrackPrefix: 'Send ',
  unlockTipGatedTrackSuffix: ' a tip',
  unlockedTipGatedTrackPrefix: 'Thank you for tipping ',
  unlockedSpecialAccessGatedTrackSuffix: '! This track is now available.',
  unlocked: 'UNLOCKED',
}

const LockedPremiumTrackSection = ({ premiumConditions }:  { premiumConditions: PremiumConditions }) => {
  const { follow_user_id: followUserId, tip_user_id: tipUserId } = premiumConditions
  const users = useSelector<AppState, { [id: ID]: User }>((state) =>
    getUsers(state, { ids: [followUserId, tipUserId].filter((id): id is number => !!id) })
  )
  console.log({ followUserId, tipUserId, users })
  const followeeUserName = followUserId ? users[followUserId].name : null
  const tippedUserName = tipUserId ? users[tipUserId].name : null

  const handleGoToCollection = () => {

  }

  const handleFollow = () => {

  }

  const handleSendTip = () => {

  }

  const renderLockedDescription = useCallback(() => {
    if (premiumConditions.nft_collection) {
      return <div className={styles.premiumContentSectionDescription}>
        <p>{messages.unlockCollectibleGatedTrack}</p>
        <div className={styles.premiumContentSectionCollection}>
          <img src={premiumConditions.nft_collection.imageUrl} alt={`${premiumConditions.nft_collection.name} nft collection`} />
          {premiumConditions.nft_collection.name}
        </div>
      </div>
    }
    if (premiumConditions.follow_user_id) {
      return <div className={styles.premiumContentSectionDescription}>
        <p>
          {messages.unlockFollowGatedTrackPrefix}
          {followeeUserName}
          <UserBadges
            userId={premiumConditions.follow_user_id}
            className={styles.badgeIcon}
            badgeSize={14}
            useSVGTiers
          />
        </p>
      </div>
    }
    if (premiumConditions.tip_user_id) {
      return <div className={styles.premiumContentSectionDescription}>
        <p>
          {messages.unlockTipGatedTrackPrefix}
          {tippedUserName}
          <UserBadges
            userId={premiumConditions.tip_user_id}
            className={styles.badgeIcon}
            badgeSize={14}
            useSVGTiers
          />
          {messages.unlockTipGatedTrackSuffix}
        </p>
      </div>
    }
    // should not reach here
    return null
  }, [premiumConditions])

  const renderButton = useCallback(() => {
    if (premiumConditions.nft_collection) {
      return <div className={styles.premiumContentSectionButton}>
        <Button
          text={messages.goToCollection}
          onClick={handleGoToCollection}
          rightIcon={<IconExternalLink />}
          type={ButtonType.PRIMARY_ALT}
          iconClassName={styles.buttonIcon}
          textClassName={styles.buttonText}
        />
      </div>
    }
    if (premiumConditions.follow_user_id) {
      return <div className={styles.premiumContentSectionButton}>
        <FollowButton
          className={styles.followButton}
          messages={{ follow: messages.followArtist, unfollow: '', following: '' }}
          onFollow={handleFollow}
          invertedColor
        />
      </div>
    }
    if (premiumConditions.tip_user_id) {
      return <div className={styles.premiumContentSectionButton}>
        <Button
          text={messages.sendTip}
          onClick={handleSendTip}
          rightIcon={<IconTip />}
          type={ButtonType.PRIMARY_ALT}
          iconClassName={styles.buttonIcon}
          textClassName={styles.buttonText}
        />
      </div>
    }
    // should not reach here
    return null
  }, [premiumConditions])

  return (
    <div className={styles.premiumContentSectionLocked}>
      <div>
        <div className={styles.premiumContentSectionTitle}>
          <IconLock className={styles.lockedIcon} />
          {messages.howToUnlock}
        </div>
        {renderLockedDescription()}
      </div>
      {renderButton()}
    </div>
  )
}

const UnlockedPremiumTrackSection = ({ premiumConditions }:  { premiumConditions: PremiumConditions }) => {
  return (
    <div>
      <div>
        {/* <IconUnlock className={styles.unlockedIcon} /> */}
        {messages.unlocked}
      </div>
    </div>
  )
}

type PremiumTrackSectionProps = {
  isLoading: boolean
  premiumConditions: PremiumConditions
  doesUserHaveAccess: boolean
}

export const PremiumTrackSection = ({ isLoading, premiumConditions, doesUserHaveAccess }: PremiumTrackSectionProps) => {
  const { isEnabled: isPremiumContentEnabled } = useFlag(
    FeatureFlags.PREMIUM_CONTENT_ENABLED
  )

  const fadeIn = {
    [styles.show]: !isLoading,
    [styles.hide]: isLoading
  }

  if (!isPremiumContentEnabled) {
    return null
  }

  return (
    <div className={cn(styles.premiumContentSection, fadeIn)}>
      {doesUserHaveAccess
        ? <UnlockedPremiumTrackSection premiumConditions={premiumConditions} />
        : <LockedPremiumTrackSection premiumConditions={premiumConditions} />}
    </div>
  )
}
