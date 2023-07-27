import cn from 'classnames'
import { Link } from 'react-router-dom'

import { LockedStatusBadge } from 'components/track/LockedStatusBadge'
import typeStyles from 'components/typography/typography.module.css'
import { TERMS_OF_SERVICE } from 'utils/route'

import styles from './PayToUnlockInfo.module.css'

const messages = {
  payToUnlock: 'Pay to unlock',
  copyPart1: 'By clicking on "Buy", you agree to our ',
  termsOfUse: 'Terms of Use',
  copyPart2:
    '. Your purchase will be made in USDC via 3rd party payment provider. Additional payment provider fees may apply. Any remaining USDC balance in your Audius wallet will be applied to this transaction. Once your payment is confirmed, your premium content will be unlocked and available to stream.'
}

export const PayToUnlockInfo = () => {
  return (
    <div className={styles.container}>
      <div
        className={cn(
          styles.header,
          typeStyles.labelLarge,
          typeStyles.labelStrong
        )}
      >
        <span>{messages.payToUnlock}</span>
        <LockedStatusBadge locked />
      </div>
      <div className={cn(styles.copy, typeStyles.bodyMedium)}>
        <span>{messages.copyPart1}</span>
        <Link
          className={typeStyles.link}
          to={TERMS_OF_SERVICE}
          target='_blank'
          rel='noreferrer'
        >
          {messages.termsOfUse}
        </Link>
        <span>{messages.copyPart2}</span>
      </div>
    </div>
  )
}
