import { useContext } from 'react'

import { Status, buyAudioActions, buyAudioSelectors } from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'
import { useAsync } from 'react-use'

import {
  CoinbasePayButtonProvider,
  CoinbasePayButtonCustom,
  CoinbasePayContext
} from 'components/coinbase-pay-button'
import { getRootSolanaAccount } from 'services/audius-backend/BuyAudio'

import styles from './AmountInputPage.module.css'
import { AudioAmountPicker } from './AudioAmountPicker'
import { PurchaseQuote } from './PurchaseQuote'

const messages = {
  intermediateSolNoticeCoinbase:
    'An intermediate purchase of sol will be made via Coinbase Pay and then converted to $AUDIO.'
}

const BuyButton = () => {
  const rootAccount = useAsync(getRootSolanaAccount)
  return (
    <CoinbasePayButtonProvider
      destinationWalletAddress={rootAccount.value?.publicKey.toString()}
    >
      <div className={styles.buyButtonContainer}>
        <CoinbaseBuyButton />
      </div>
      <div className={styles.conversionNotice}>
        {messages.intermediateSolNoticeCoinbase}
      </div>
    </CoinbasePayButtonProvider>
  )
}

const CoinbaseBuyButton = () => {
  const coinbasePay = useContext(CoinbasePayContext)
  const purchaseInfoStatus = useSelector(
    buyAudioSelectors.getAudioPurchaseInfoStatus
  )
  const isDisabled = purchaseInfoStatus === Status.ERROR
  return (
    <CoinbasePayButtonCustom
      disabled={isDisabled}
      isDisabled={isDisabled}
      onClick={() => {
        console.log('clicked')
        coinbasePay.open()
      }}
    />
  )
}

export const AmountInputPage = () => {
  const dispatch = useDispatch()
  return (
    <div className={styles.inputPage}>
      <AudioAmountPicker
        presetAmounts={['5', '10', '25', '50', '100']}
        onAmountChanged={(amount) => {
          const audioAmount = parseInt(amount)
          if (!isNaN(audioAmount)) {
            dispatch(
              buyAudioActions.calculateAudioPurchaseInfo({
                audioAmount
              })
            )
          }
        }}
      />
      <PurchaseQuote />
      <BuyButton />
    </div>
  )
}
