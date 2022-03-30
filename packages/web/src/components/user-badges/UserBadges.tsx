import React, { cloneElement, ReactElement } from 'react'

import cn from 'classnames'

import { ReactComponent as IconBronzeBadgeSVG } from 'assets/img/IconBronzeBadge.svg'
import { ReactComponent as IconGoldBadgeSVG } from 'assets/img/IconGoldBadge.svg'
import { ReactComponent as IconPlatinumBadgeSVG } from 'assets/img/IconPlatinumBadge.svg'
import { ReactComponent as IconSilverBadgeSVG } from 'assets/img/IconSilverBadge.svg'
import { ReactComponent as IconVerified } from 'assets/img/iconVerified.svg'
import IconBronzeBadge from 'assets/img/tokenBadgeBronze40@2x.png'
import IconGoldBadge from 'assets/img/tokenBadgeGold40@2x.png'
import IconPlatinumBadge from 'assets/img/tokenBadgePlatinum40@2x.png'
import IconSilverBadge from 'assets/img/tokenBadgeSilver40@2x.png'
import { useSelectTierInfo } from 'common/hooks/wallet'
import { BadgeTier } from 'common/models/BadgeTier'
import { ID } from 'common/models/Identifiers'
import { Nullable } from 'common/utils/typeUtils'

import styles from './UserBadges.module.css'

const audioTierMapSVG: { [tier in BadgeTier]: Nullable<ReactElement> } = {
  none: null,
  bronze: <IconBronzeBadgeSVG />,
  silver: <IconSilverBadgeSVG />,
  gold: <IconGoldBadgeSVG />,
  platinum: <IconPlatinumBadgeSVG />
}

export const audioTierMapPng: {
  [tier in BadgeTier]: Nullable<ReactElement>
} = {
  none: null,
  bronze: <img draggable={false} alt='' src={IconBronzeBadge} />,
  silver: <img draggable={false} alt='' src={IconSilverBadge} />,
  gold: <img draggable={false} alt='' src={IconGoldBadge} />,
  platinum: <img draggable={false} alt='' src={IconPlatinumBadge} />
}

type UserBadgesProps = {
  userId: ID
  badgeSize: number
  className?: string
  useSVGTiers?: boolean
  inline?: boolean

  // Normally, user badges is not a controlled component and selects
  // badges off of the store. The override allows for it to be used
  // in a controlled context where the desired store state is not available.
  isVerifiedOverride?: boolean
  overrideTier?: BadgeTier
}

const UserBadges: React.FC<UserBadgesProps> = ({
  userId,
  badgeSize,
  className,
  useSVGTiers = false,
  inline = false,
  isVerifiedOverride,
  overrideTier
}) => {
  let { tier, isVerified } = useSelectTierInfo(userId)
  tier = overrideTier || tier
  const tierMap = useSVGTiers ? audioTierMapSVG : audioTierMapPng
  const audioBadge = tierMap[tier as BadgeTier]

  if (inline) {
    return (
      <span className={cn(styles.inlineContainer, className)}>
        {(isVerifiedOverride ?? isVerified) && (
          <IconVerified height={badgeSize} width={badgeSize} />
        )}
        {audioBadge &&
          cloneElement(audioBadge, { height: badgeSize, width: badgeSize })}
      </span>
    )
  }
  return (
    <div className={cn(styles.container, className)}>
      {(isVerifiedOverride ?? isVerified) && (
        <IconVerified height={badgeSize} width={badgeSize} />
      )}
      {audioBadge &&
        cloneElement(audioBadge, { height: badgeSize, width: badgeSize })}
    </div>
  )
}

export default UserBadges
