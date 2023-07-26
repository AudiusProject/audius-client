import {
  cacheTracksSelectors,
  cacheUsersSelectors,
  CommonState,
  getDogEarType,
  ID,
  isPremiumContentCollectibleGated,
  isPremiumContentUSDCPurchaseGated,
  SquareSizes,
  Track,
  User
} from '@audius/common'
import { IconCart, IconCollectible, IconSpecialAccess } from '@audius/stems'
import cn from 'classnames'
import { useSelector } from 'react-redux'

import { Icon } from 'components/Icon'
import { DogEar } from 'components/dog-ear'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import UserBadges from 'components/user-badges/UserBadges'
import { useTrackCoverArt } from 'hooks/useTrackCoverArt'
import { profilePage } from 'utils/route'

import styles from './LockedTrackDetailsTile.module.css'

const { getTrack } = cacheTracksSelectors
const { getUser } = cacheUsersSelectors

const messages = {
  collectibleGated: 'COLLECTIBLE GATED',
  specialAccess: 'SPECIAL ACCESS',
  premiumContent: 'PREMIUM CONTENT'
}

export type LockedTrackDetailsTileProps = {
  trackId: ID
}

export const LockedTrackDetailsTileContent = ({
  track,
  owner
}: {
  track: Track
  owner: User
}) => {
  const {
    track_id: trackId,
    title,
    premium_conditions: premiumConditions
  } = track
  const image = useTrackCoverArt(
    trackId,
    track._cover_art_sizes ?? null,
    SquareSizes.SIZE_150_BY_150,
    ''
  )

  const dogEarType = getDogEarType({
    doesUserHaveAccess: false,
    isOwner: false,
    premiumConditions
  })
  const label = `${title} by ${owner.name}`
  const isCollectibleGated = isPremiumContentCollectibleGated(premiumConditions)
  const isUSDCPurchaseGated =
    isPremiumContentUSDCPurchaseGated(premiumConditions)

  let IconComponent = IconSpecialAccess
  let message = messages.specialAccess

  if (isCollectibleGated) {
    IconComponent = IconCollectible
    message = messages.collectibleGated
  } else if (isUSDCPurchaseGated) {
    IconComponent = IconCart
    message = messages.premiumContent
  }

  return (
    <div className={styles.trackDetails}>
      <DynamicImage
        wrapperClassName={styles.trackImageWrapper}
        className={styles.trackImage}
        image={image}
        aria-label={label}
      />
      {dogEarType ? <DogEar type={dogEarType} /> : null}
      <div>
        <div
          className={cn(styles.premiumContentLabel, {
            [styles.usdcContentLabel]: isUSDCPurchaseGated
          })}
        >
          <Icon size='small' icon={IconComponent} />
          <span>{message}</span>
        </div>
        <p className={styles.trackTitle}>{title}</p>
        <div className={styles.trackOwner}>
          <span className={styles.by}>By</span>
          <a className={styles.trackOwnerName} href={profilePage(owner.handle)}>
            {owner.name}
          </a>
          <UserBadges
            userId={owner.user_id}
            className={styles.badgeIcon}
            badgeSize={14}
            useSVGTiers
            inline
          />
        </div>
      </div>
    </div>
  )
}

export const LockedTrackDetailsTile = ({
  trackId
}: LockedTrackDetailsTileProps) => {
  const track = useSelector((state: CommonState) =>
    getTrack(state, { id: trackId })
  )
  const owner = useSelector((state: CommonState) => {
    return track?.owner_id ? getUser(state, { id: track.owner_id }) : null
  })

  return track && owner ? (
    <LockedTrackDetailsTileContent track={track} owner={owner} />
  ) : null
}
