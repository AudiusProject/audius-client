import { useCallback, useEffect, useMemo } from 'react'

import {
  FeatureFlags,
  PremiumConditions,
  cacheUsersSelectors,
  User,
  ID,
  Nullable,
  Chain,
  usersSocialActions as socialActions,
  premiumContentActions,
  FollowSource,
  tippingSelectors,
  tippingActions,
  premiumContentSelectors,
  accountSelectors
} from '@audius/common'
import { Button, ButtonType, IconLock, IconUnlocked } from '@audius/stems'
import cn from 'classnames'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'
import { usePrevious } from 'react-use'

import { ReactComponent as IconExternalLink } from 'assets/img/iconExternalLink.svg'
import { ReactComponent as IconVerifiedGreen } from 'assets/img/iconVerifiedGreen.svg'
import { showRequiresAccountModal } from 'common/store/pages/signon/actions'
import FollowButton from 'components/follow-button/FollowButton'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { IconTip } from 'components/notification/Notification/components/icons'
import UserBadges from 'components/user-badges/UserBadges'
import { useFlag } from 'hooks/useRemoteConfig'
import { AppState } from 'store/types'
import { SIGN_UP_PAGE } from 'utils/route'
import { parseTrackRoute } from 'utils/route/trackRouteParser'

import styles from './GiantTrackTile.module.css'

const { getUsers } = cacheUsersSelectors
const { getSendStatus } = tippingSelectors
const { beginTip } = tippingActions
const { getPremiumTrackStatus } = premiumContentSelectors
const { updatePremiumTrackStatus, refreshPremiumTrack } = premiumContentActions
const { getAccountUser } = accountSelectors

const messages = {
  howToUnlock: 'HOW TO UNLOCK',
  unlocking: 'UNLOCKING',
  unlocked: 'UNLOCKED',
  goToCollection: 'Go To Collection',
  sendTip: 'Send Tip',
  followArtist: 'Follow Artist',
  unlockCollectibleGatedTrack:
    'To unlock this track, you must link a wallet containing a collectible from:',
  aCollectibleFrom: 'A Collectible from ',
  unlockingCollectibleGatedTrackSuffix: ' was found in a linked wallet.',
  unlockedCollectibleGatedTrackSuffix:
    ' was found in a linked wallet. This track is now available.',
  unlockFollowGatedTrackPrefix: 'Follow ',
  thankYouForFollowing: 'Thank you for following ',
  unlockingFollowGatedTrackSuffix: '!',
  unlockedFollowGatedTrackSuffix: '! This track is now available.',
  unlockTipGatedTrackPrefix: 'Send ',
  unlockTipGatedTrackSuffix: ' a tip',
  thankYouForSupporting: 'Thank you for supporting ',
  unlockingTipGatedTrackSuffix: ' by sending them a tip!',
  unlockedTipGatedTrackSuffix: ' by sending them a tip! This track is now available.'
}

type PremiumTrackAccessSectionProps = {
  premiumConditions: PremiumConditions
  followee: Nullable<User>
  tippedUser: Nullable<User>
}

const LockedPremiumTrackSection = ({
  premiumConditions,
  followee,
  tippedUser
}: PremiumTrackAccessSectionProps) => {
  const dispatch = useDispatch()
  const sendStatus = useSelector(getSendStatus)
  const previousSendStatus = usePrevious(sendStatus)
  const premiumTrackStatus = useSelector(getPremiumTrackStatus)
  const account = useSelector(getAccountUser)

  // Set unlocking state if send tip is successful and user closed the tip modal.
  useEffect(() => {
    if (previousSendStatus === 'SUCCESS' && sendStatus === null) {
      dispatch(updatePremiumTrackStatus({ status: 'UNLOCKING' }))

      // Poll discovery to get user's premium content signature for this track.
      const trackParams = parseTrackRoute(window.location.pathname)
      dispatch(refreshPremiumTrack({ trackParams }))
    }
  }, [dispatch, previousSendStatus, sendStatus])

  const handleSendTip = useCallback(() => {
    if (account) {
      dispatch(beginTip({ user: tippedUser, source: 'trackPage' }))
    } else {
      dispatch(pushRoute(SIGN_UP_PAGE))
      dispatch(showRequiresAccountModal())
    }
  }, [dispatch, account, tippedUser])

  const handleFollow = useCallback(() => {
    if (account) {
      if (premiumConditions.follow_user_id) {
        dispatch(
          socialActions.followUser(
            premiumConditions.follow_user_id,
            FollowSource.TRACK_PAGE
          )
        )
        // Set unlocking state if user has clicked on button to follow artist.
        dispatch(updatePremiumTrackStatus({ status: 'UNLOCKING' }))

        // Poll discovery to get user's premium content signature for this track.
        const trackParams = parseTrackRoute(window.location.pathname)
        dispatch(refreshPremiumTrack({ trackParams }))
      }
    } else {
      dispatch(pushRoute(SIGN_UP_PAGE))
      dispatch(showRequiresAccountModal())
    }
  }, [dispatch, account, premiumConditions])

  const handleGoToCollection = useCallback(() => {
    const { chain, address, externalLink } =
      premiumConditions.nft_collection ?? {}
    if (chain === Chain.Eth && 'slug' in premiumConditions.nft_collection!) {
      const url = `https://opensea.io/collection/${premiumConditions.nft_collection.slug}`
      window.open(url, '_blank')
    } else if (chain === Chain.Sol) {
      const explorerUrl = `https://explorer.solana.com/address/${address}`
      const url = externalLink ? new URL(externalLink).hostname : explorerUrl
      window.open(url, '_blank')
    }
  }, [premiumConditions])

  const renderLockedDescription = useCallback(() => {
    if (premiumConditions.nft_collection) {
      if (premiumTrackStatus === 'UNLOCKING') {
        return (
          <div className={styles.premiumContentSectionDescription}>
            <p>
              <LoadingSpinner className={styles.spinner} />
              {messages.aCollectibleFrom}
              <span className={styles.collectibleName}>
                &nbsp;{premiumConditions.nft_collection.name}&nbsp;
              </span>
              {messages.unlockingCollectibleGatedTrackSuffix}
            </p>
          </div>
        )
      }
      return (
        <div className={styles.premiumContentSectionDescription}>
          <p>{messages.unlockCollectibleGatedTrack}</p>
          <div className={styles.premiumContentSectionCollection}>
            {premiumConditions.nft_collection.imageUrl && (
              <img
                src={premiumConditions.nft_collection.imageUrl}
                alt={`${premiumConditions.nft_collection.name} nft collection`}
              />
            )}
            {premiumConditions.nft_collection.name}
          </div>
        </div>
      )
    }

    if (premiumConditions.follow_user_id) {
      if (premiumTrackStatus === 'UNLOCKING') {
        return (
          <div className={styles.premiumContentSectionDescription}>
            <p>
              <LoadingSpinner className={styles.spinner} />
              {messages.thankYouForFollowing}
              {followee?.name}
              <UserBadges
                userId={premiumConditions.follow_user_id}
                className={styles.badgeIcon}
                badgeSize={14}
                useSVGTiers
                />
              {messages.unlockingFollowGatedTrackSuffix}
            </p>
          </div>
        )
      }
      return (
        <div className={styles.premiumContentSectionDescription}>
          <p>
            {messages.unlockFollowGatedTrackPrefix}
            {followee?.name}
            <UserBadges
              userId={premiumConditions.follow_user_id}
              className={styles.badgeIcon}
              badgeSize={14}
              useSVGTiers
            />
          </p>
        </div>
      )
    }

    if (premiumConditions.tip_user_id) {
      if (premiumTrackStatus === 'UNLOCKING') {
        return (
          <div className={styles.premiumContentSectionDescription}>
            <p>
              <LoadingSpinner className={styles.spinner} />
              {messages.thankYouForSupporting}
              {followee?.name}
              <UserBadges
                userId={premiumConditions.follow_user_id}
                className={styles.badgeIcon}
                badgeSize={14}
                useSVGTiers
              />
              {messages.unlockingTipGatedTrackSuffix}
            </p>
          </div>
        )
      }
      return (
        <div className={styles.premiumContentSectionDescription}>
          <p>
            {messages.unlockTipGatedTrackPrefix}
            {tippedUser?.name}
            <UserBadges
              userId={premiumConditions.tip_user_id}
              className={styles.badgeIcon}
              badgeSize={14}
              useSVGTiers
            />
            {messages.unlockTipGatedTrackSuffix}
          </p>
        </div>
      )
    }

    // should not reach here
    return null
  }, [premiumConditions, followee, tippedUser])

  const renderButton = useCallback(() => {
    if (premiumTrackStatus === 'UNLOCKING') {
      return null
    }

    if (premiumConditions.nft_collection) {
      return (
        <Button
          text={messages.goToCollection}
          onClick={handleGoToCollection}
          rightIcon={<IconExternalLink />}
          type={ButtonType.PRIMARY_ALT}
          iconClassName={styles.buttonIcon}
          textClassName={styles.buttonText}
        />
      )
    }

    if (premiumConditions.follow_user_id) {
      return (
        <FollowButton
          className={styles.followButton}
          messages={{
            follow: messages.followArtist,
            unfollow: '',
            following: ''
          }}
          onFollow={handleFollow}
          invertedColor
        />
      )
    }

    if (premiumConditions.tip_user_id) {
      return (
        <Button
          text={messages.sendTip}
          onClick={handleSendTip}
          rightIcon={<IconTip />}
          type={ButtonType.PRIMARY_ALT}
          iconClassName={styles.buttonIcon}
          textClassName={styles.buttonText}
        />
      )
    }

    // should not reach here
    return null
  }, [
    premiumConditions,
    handleGoToCollection,
    handleFollow,
    handleSendTip,
    premiumTrackStatus
  ])

  return (
    <div className={styles.premiumContentSectionLocked}>
      <div>
        <div className={styles.premiumContentSectionTitle}>
          <IconLock className={styles.lockedIcon} />
          {premiumTrackStatus === 'UNLOCKING' ? messages.unlocking : messages.howToUnlock}
        </div>
        {renderLockedDescription()}
      </div>
      <div className={styles.premiumContentSectionButton}>{renderButton()}</div>
    </div>
  )
}

const UnlockedPremiumTrackSection = ({
  premiumConditions,
  followee,
  tippedUser
}: PremiumTrackAccessSectionProps) => {
  const renderUnlockedDescription = useCallback(() => {
    if (premiumConditions.nft_collection) {
      return (
        <p>
          <IconVerifiedGreen className={styles.verifiedGreenIcon} />
          {messages.aCollectibleFrom}
          <span className={styles.collectibleName}>
            &nbsp;{premiumConditions.nft_collection.name}&nbsp;
          </span>
          {messages.unlockedCollectibleGatedTrackSuffix}
        </p>
      )
    }

    if (premiumConditions.follow_user_id) {
      return (
        <p>
          <IconVerifiedGreen className={styles.verifiedGreenIcon} />
          {messages.thankYouForFollowing}
          {followee?.name}
          <UserBadges
            userId={premiumConditions.follow_user_id}
            className={styles.badgeIcon}
            badgeSize={14}
            useSVGTiers
          />
          {messages.unlockedFollowGatedTrackSuffix}
        </p>
      )
    }

    if (premiumConditions.tip_user_id) {
      return (
        <p>
          <IconVerifiedGreen className={styles.verifiedGreenIcon} />
          {messages.thankYouForSupporting}
          {tippedUser?.name}
          <UserBadges
            userId={premiumConditions.tip_user_id}
            className={styles.badgeIcon}
            badgeSize={14}
            useSVGTiers
          />
          {messages.unlockedTipGatedTrackSuffix}
        </p>
      )
    }

    // should not reach here
    return null
  }, [premiumConditions, followee, tippedUser])

  return (
    <div className={styles.premiumContentSectionUnlocked}>
      <div className={styles.premiumContentSectionTitle}>
        <IconUnlocked className={styles.unlockedIcon} />
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

export const PremiumTrackSection = ({
  isLoading,
  premiumConditions,
  doesUserHaveAccess
}: PremiumTrackSectionProps) => {
  const { isEnabled: isPremiumContentEnabled } = useFlag(
    FeatureFlags.PREMIUM_CONTENT_ENABLED
  )
  const { follow_user_id: followUserId, tip_user_id: tipUserId } =
    premiumConditions ?? {}
  const users = useSelector<AppState, { [id: ID]: User }>((state) =>
    getUsers(state, {
      ids: [followUserId, tipUserId].filter((id): id is number => !!id)
    })
  )
  const followee = useMemo(
    () => (followUserId ? users[followUserId] : null),
    [users, followUserId]
  )
  const tippedUser = useMemo(
    () => (tipUserId ? users[tipUserId] : null),
    [users, tipUserId]
  )
  const shouldDisplay =
    (premiumConditions ?? {}).nft_collection || followee || tippedUser

  const fadeIn = {
    [styles.show]: !isLoading,
    [styles.hide]: isLoading
  }

  if (!isPremiumContentEnabled) return null
  if (!premiumConditions) return null
  if (!shouldDisplay) return null

  return (
    <div className={cn(styles.premiumContentSection, fadeIn)}>
      {doesUserHaveAccess ? (
        <UnlockedPremiumTrackSection
          premiumConditions={premiumConditions}
          followee={followee}
          tippedUser={tippedUser}
        />
      ) : (
        <LockedPremiumTrackSection
          premiumConditions={premiumConditions}
          followee={followee}
          tippedUser={tippedUser}
        />
      )}
    </div>
  )
}
