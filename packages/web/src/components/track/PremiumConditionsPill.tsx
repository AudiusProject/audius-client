import { PremiumConditions, formatStringUSDC } from '@audius/common'
import { IconLock } from '@audius/stems'
import cn from 'classnames'

import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'

import styles from './PremiumConditionsPill.module.css'
import { isPremiumContentUSDCPurchaseGated } from './helpers'

const messages = {
  unlocking: 'Unlocking',
  locked: 'Locked'
}

export const PremiumConditionsPill = ({
  premiumConditions,
  unlocking
}: {
  premiumConditions: PremiumConditions
  unlocking: boolean
}) => {
  const isPurchase = isPremiumContentUSDCPurchaseGated(premiumConditions)
  const icon = unlocking ? (
    <LoadingSpinner className={styles.spinner} />
  ) : isPurchase ? null : (
    <IconLock />
  )
  const message = unlocking
    ? messages.unlocking
    : isPurchase
    ? `$${formatStringUSDC(premiumConditions.usdc_purchase.price)}`
    : messages.locked
  const colorStyle = isPurchase ? styles.premiumContent : styles.gatedContent

  return (
    <div className={cn(styles.container, colorStyle)}>
      {icon}
      {message}
    </div>
  )
}
