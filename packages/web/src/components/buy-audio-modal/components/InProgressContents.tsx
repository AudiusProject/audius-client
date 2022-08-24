import {
  buyAudioSelectors,
  BuyAudioStage,
  formatNumberString
} from '@audius/common'
import { IconCaretDown } from '@audius/stems'
import { useSelector } from 'react-redux'

import { CollapsibleContent } from 'components/collapsible-content'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'

import { IconAUDIO, IconSOL, IconUSD } from './Icons'
import styles from './InProgressContents.module.css'

const { getAudioPurchaseInfo, getBuyAudioFlowStage } = buyAudioSelectors

const messages = {
  pleaseHold: 'Please hold on. This may take a few moments.',
  completeWithCoinbase: 'Complete this step with Coinbase',
  step1: 'Step 1',
  step2: 'Step 2',
  purchasingSol: 'Purchasing SOL',
  convertingSol: 'Converting SOL to $AUDIO',
  moreInfo: 'More Info',
  lessInfo: 'Less Info',
  usd: 'USD',
  sol: 'SOL',
  audio: '$AUDIO'
}

export const InProgressContents = () => {
  const purchaseInfo = useSelector(getAudioPurchaseInfo)
  const buyAudioFlowStage = useSelector(getBuyAudioFlowStage)
  const isStepOne = buyAudioFlowStage === BuyAudioStage.PURCHASING
  let firstToken, secondToken
  if (purchaseInfo?.isError === false) {
    const solToken = {
      label: messages.sol,
      icon: <IconSOL />,
      amount: formatNumberString(purchaseInfo.estimatedSOL.uiAmountString, {
        maxDecimals: 2
      })
    }
    if (isStepOne) {
      firstToken = {
        label: messages.usd,
        icon: <IconUSD />,
        amount: formatNumberString(purchaseInfo.estimatedUSD.uiAmountString, {
          minDecimals: 2,
          maxDecimals: 2
        })
      }
      secondToken = solToken
    } else {
      firstToken = solToken
      secondToken = {
        label: messages.audio,
        icon: <IconAUDIO />,
        amount: formatNumberString(
          purchaseInfo.desiredAudioAmount.uiAmountString,
          {
            maxDecimals: 2
          }
        )
      }
    }
  }
  return (
    <div className={styles.inProgressPage}>
      <div className={styles.header}>{messages.pleaseHold}</div>
      <div className={styles.loader}>
        <LoadingSpinner className={styles.spinner} />
        <span className={styles.headerCaps}>
          {isStepOne ? messages.step1 : messages.step2}
        </span>
      </div>
      {isStepOne ? (
        <div className={styles.callToAction}>
          {messages.completeWithCoinbase}
        </div>
      ) : null}
      <CollapsibleContent
        id='buy-audio-more-info'
        className={styles.showMoreToggle}
        toggleButtonClassName={styles.showMoreToggleButton}
        showText={messages.moreInfo}
        hideText={messages.lessInfo}
      >
        <div className={styles.moreInfo}>
          <div className={styles.headerCaps}>
            {isStepOne ? messages.purchasingSol : messages.convertingSol}
          </div>
          <div className={styles.quote}>
            {firstToken?.icon}
            <span className={styles.amount}>{firstToken?.amount}</span>
            <span className={styles.headerCaps}>{firstToken?.label}</span>
            <IconCaretDown className={styles.caret} />
            {secondToken?.icon}
            <span className={styles.amount}>{secondToken?.amount}</span>
            <span className={styles.headerCaps}>{secondToken?.label}</span>
          </div>
        </div>
      </CollapsibleContent>
    </div>
  )
}
