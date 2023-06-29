import { PremiumConditions, Nullable } from '@audius/common'
import { IconCollectible, IconSpecialAccess } from '@audius/stems'
import cn from 'classnames'

import styles from './PremiumContentLabel.module.css'

const messages = {
  collectibleGated: 'Collectible Gated',
  specialAccess: 'Special Access'
}

/** Renders a label indicating a premium content type. If the user does
 * not yet have access or is the owner, the label will be in an accented color.
 */
export const PremiumContentLabel = ({
  premiumConditions,
  doesUserHaveAccess,
  isOwner
}: {
  premiumConditions?: Nullable<PremiumConditions>
  doesUserHaveAccess: boolean
  isOwner: boolean
}) => {
  const showColor = isOwner || !doesUserHaveAccess
  let message = messages.specialAccess
  let IconComponent = IconSpecialAccess
  const colorStyle = styles.gatedContent

  if (premiumConditions?.nft_collection) {
    message = messages.collectibleGated
    IconComponent = IconCollectible
  }

  return (
    <div className={cn(styles.labelContainer, { [colorStyle]: showColor })}>
      <IconComponent className={styles.icon} />
      {message}
    </div>
  )
}
