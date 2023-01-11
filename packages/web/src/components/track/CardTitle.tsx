import { FeatureFlags, PremiumConditions } from '@audius/common'
import Tooltip from 'components/tooltip/Tooltip'
import HiddenTrackHeader from 'pages/track-page/components/HiddenTrackHeader'
import { useFlag } from 'hooks/useRemoteConfig'
import { IconCollectible, IconSpecialAccess } from '@audius/stems'
import cn from 'classnames'

import styles from './GiantTrackTile.module.css'

const messages = {
  trackTitle: 'TRACK',
  remixTitle: 'REMIX',
  hiddenTrackTooltip: 'Anyone with a link to this page will be able to see it',
  collectibleGated: 'COLLECTIBLE GATED',
  specialAccess: 'SPECIAL ACCESS'
}

type CardTitleProps = {
  className: string
  isUnlisted: boolean
  isRemix: boolean
  isPremium: boolean
  premiumConditions: PremiumConditions
}

export const CardTitle = ({
  className,
  isUnlisted,
  isRemix,
  isPremium,
  premiumConditions
}: CardTitleProps) => {
  const { isEnabled: isPremiumContentEnabled } = useFlag(
    FeatureFlags.PREMIUM_CONTENT_ENABLED
  )

  // if (isPremiumContentEnabled && isPremium) {
  if (true) {
      return (
        <div className={cn(styles.headerContainer, className, styles.premiumContent)}>
          {premiumConditions?.nft_collection
            ? <div className={styles.typeLabel}>
                <IconCollectible />
                {messages.collectibleGated}
              </div>
            : <div className={styles.typeLabel}>
                <IconSpecialAccess />
                {messages.specialAccess}
              </div>}
        </div>
      )
    }

    // if (!isUnlisted) {
    //   return (
    //     <div className={cn(styles.headerContainer, className)}>
    //       <div className={styles.typeLabel}>
    //         {isRemix ? messages.remixTitle : messages.trackTitle}
    //       </div>
    //     </div>
    //   )
    // }

    // return (
    //   <div className={cn(styles.headerContainer, className)}>
    //     <Tooltip
    //       text={messages.hiddenTrackTooltip}
    //       mouseEnterDelay={0}
    //       shouldWrapContent={false}
    //     >
    //       <div>
    //         <HiddenTrackHeader />
    //       </div>
    //     </Tooltip>
    //   </div>
    // )
}
