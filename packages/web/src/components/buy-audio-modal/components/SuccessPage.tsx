import {
  BNAudio,
  BNWei,
  buyAudioSelectors,
  formatWei,
  walletSelectors
} from '@audius/common'
import { Button, ButtonSize, ButtonType, IconInfo } from '@audius/stems'
import BN from 'bn.js'

import { useSelector } from 'common/hooks/useSelector'

import { IconAUDIO } from './Icons'
import styles from './SuccessPage.module.css'

const messages = {
  successMessage: 'Transaction Was Successful!',
  audio: '$AUDIO',
  review: 'Review Transaction'
}

const { getAccountTotalBalance } = walletSelectors
const { getAudioPurchaseInfo } = buyAudioSelectors

export const SuccessPage = () => {
  const totalBalance = useSelector<BNAudio>(getAccountTotalBalance)
  const uiBalance = formatWei(totalBalance || (new BN(0) as BNWei), true, 0)
  const purchaseInfo = useSelector(getAudioPurchaseInfo)

  return (
    <div className={styles.successPage}>
      <div className={styles.message}>{messages.successMessage}</div>
      <div className={styles.results}>
        <div className={styles.purchasedAmount}>
          <IconAUDIO />
          <span className={styles.label}>{messages.audio}</span>
          <span>
            +
            {purchaseInfo?.isError === false
              ? purchaseInfo.desiredAudioAmount.uiAmountString
              : '0'}
          </span>
        </div>
        <div className={styles.newBalance}>
          {uiBalance}
          <span className={styles.label}>{messages.audio}</span>
        </div>
      </div>
      <Button text='Done' type={ButtonType.PRIMARY_ALT} />
      <div className={styles.review}>
        <Button
          iconClassName={styles.reviewButtonIcon}
          type={ButtonType.TEXT}
          size={ButtonSize.SMALL}
          text={messages.review}
          leftIcon={<IconInfo />}
        />
      </div>
    </div>
  )
}
