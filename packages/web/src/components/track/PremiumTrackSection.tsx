import { FeatureFlags, PremiumConditions, cacheUsersSelectors, User, ID, Nullable } from '@audius/common'
import { Button, ButtonType, IconLock } from '@audius/stems'
import cn from 'classnames'
import FollowButton from 'components/follow-button/FollowButton'
import { IconTip } from 'components/notification/Notification/components/icons'
import UserBadges from 'components/user-badges/UserBadges'
import { useFlag } from 'hooks/useRemoteConfig'
import { useCallback, useMemo } from 'react'
import { ReactComponent as IconExternalLink } from 'assets/img/iconExternalLink.svg'

import styles from './GiantTrackTile.module.css'
import { useSelector } from 'react-redux'
import { AppState } from 'store/types'
import { ReactComponent as IconVerifiedGreen } from 'assets/img/iconVerifiedGreen.svg'

const { getUsers } = cacheUsersSelectors

const messages = {
  howToUnlock: 'HOW TO UNLOCK',
  unlockCollectibleGatedTrack: 'To unlock this track, you must link a wallet containing a collectible from:',
  unlockedCollectibleGatedTrackPrefix: 'A Collectible from ',
  unlockedCollectibleGatedTrackSuffix: ' was found in a linked wallet. This track is now available.',
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

type PremiumTrackAccessSectionProps = {
  premiumConditions: PremiumConditions
  followeeUserName: Nullable<string>
  tippedUserName: Nullable<string>
}

const LockedPremiumTrackSection = ({ premiumConditions, followeeUserName, tippedUserName }:  PremiumTrackAccessSectionProps) => {
  const handleGoToCollection = useCallback(() => {

  }, [])

  const handleFollow = useCallback(() => {

  }, [])

  const handleSendTip = useCallback(() => {

  }, [])

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
  }, [premiumConditions, followeeUserName, tippedUserName])

  const renderButton = useCallback(() => {
    if (premiumConditions.nft_collection) {
      return <Button
        text={messages.goToCollection}
        onClick={handleGoToCollection}
        rightIcon={<IconExternalLink />}
        type={ButtonType.PRIMARY_ALT}
        iconClassName={styles.buttonIcon}
        textClassName={styles.buttonText}
      />
    }

    if (premiumConditions.follow_user_id) {
      return <FollowButton
        className={styles.followButton}
        messages={{ follow: messages.followArtist, unfollow: '', following: '' }}
        onFollow={handleFollow}
        invertedColor
      />
    }

    if (premiumConditions.tip_user_id) {
      return <Button
        text={messages.sendTip}
        onClick={handleSendTip}
        rightIcon={<IconTip />}
        type={ButtonType.PRIMARY_ALT}
        iconClassName={styles.buttonIcon}
        textClassName={styles.buttonText}
      />
    }

    // should not reach here
    return null
  }, [premiumConditions, handleGoToCollection, handleSendTip])

  return (
    <div className={styles.premiumContentSectionLocked}>
      <div>
        <div className={styles.premiumContentSectionTitle}>
          <IconLock className={styles.lockedIcon} />
          {messages.howToUnlock}
        </div>
        {renderLockedDescription()}
      </div>
      <div className={styles.premiumContentSectionButton}>
        {renderButton()}
      </div>
    </div>
  )
}

const UnlockedPremiumTrackSection = ({ premiumConditions, followeeUserName, tippedUserName }:  PremiumTrackAccessSectionProps) => {
  const renderUnlockedDescription = useCallback(() => {
    if (premiumConditions.nft_collection) {
      return <p>
        <IconVerifiedGreen className={styles.verifiedGreenIcon} />
        {messages.unlockedCollectibleGatedTrackPrefix}
        <span className={styles.collectibleName}>&nbsp;{premiumConditions.nft_collection.name}&nbsp;</span>
        {messages.unlockedCollectibleGatedTrackSuffix}
      </p>
    }

    if (premiumConditions.follow_user_id) {
      return <p>
        <IconVerifiedGreen className={styles.verifiedGreenIcon} />
        {messages.unlockedFollowGatedTrackPrefix}
        {followeeUserName}
        <UserBadges
          userId={premiumConditions.follow_user_id}
          className={styles.badgeIcon}
          badgeSize={14}
          useSVGTiers
        />
        {messages.unlockedSpecialAccessGatedTrackSuffix}
      </p>
    }

    if (premiumConditions.tip_user_id) {
      return <p>
        <IconVerifiedGreen className={styles.verifiedGreenIcon} />
        {messages.unlockedTipGatedTrackPrefix}
        {tippedUserName}
        <UserBadges
          userId={premiumConditions.tip_user_id}
          className={styles.badgeIcon}
          badgeSize={14}
          useSVGTiers
        />
        {messages.unlockedSpecialAccessGatedTrackSuffix}
      </p>
    }

    // should not reach here
    return null
  }, [premiumConditions, followeeUserName, tippedUserName])

  return (
    <div className={styles.premiumContentSectionUnlocked}>
      <div className={styles.premiumContentSectionTitle}>
        {/* <IconUnlocked className={styles.unlockedIcon} /> */}
        {messages.unlocked}
      </div>
      <div className={styles.premiumContentSectionDescription}>
        {renderUnlockedDescription()}
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
  const { follow_user_id: followUserId, tip_user_id: tipUserId } = premiumConditions
  const users = useSelector<AppState, { [id: ID]: User }>((state) =>
    getUsers(state, { ids: [followUserId, tipUserId].filter((id): id is number => !!id) })
  )
  const followeeUserName = useMemo(() => followUserId ? users[followUserId].name : null, [users, followUserId])
  const tippedUserName = useMemo(() => tipUserId ? users[tipUserId].name : null, [users, tipUserId])

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
        ? <UnlockedPremiumTrackSection
            premiumConditions={premiumConditions}
            followeeUserName={followeeUserName}
            tippedUserName={tippedUserName}
          />
        : <LockedPremiumTrackSection
            premiumConditions={premiumConditions}
            followeeUserName={followeeUserName}
            tippedUserName={tippedUserName}
          />}
    </div>
  )
}
