import { useCallback, useMemo } from 'react'

import { buyAudioActions, OnRampProvider, StringKeys } from '@audius/common'
import { useDispatch } from 'react-redux'

import { OnRampButton } from 'components/on-ramp-button'
import { useRemoteVar } from 'hooks/useRemoteConfig'

import styles from './AmountInputPage.module.css'
import { AudioAmountPicker } from './AudioAmountPicker'
import { CoinbaseBuyAudioButton } from './CoinbaseBuyAudioButton'
import { PurchaseQuote } from './PurchaseQuote'

const { calculateAudioPurchaseInfo } = buyAudioActions

const messages = {
  intermediateSolNoticeCoinbase:
    'An intermediate purchase of SOL will be made via Coinbase Pay and then converted to $AUDIO.'
}
export const AmountInputPage = ({
  provider
}: {
  provider?: OnRampProvider
}) => {
  const dispatch = useDispatch()
  const presetAmountsConfig = useRemoteVar(StringKeys.BUY_AUDIO_PRESET_AMOUNTS)

  const handleAmountChange = useCallback(
    (amount) => {
      const audioAmount = parseInt(amount)
      if (!isNaN(audioAmount)) {
        dispatch(
          calculateAudioPurchaseInfo({
            audioAmount
          })
        )
      }
    },
    [dispatch]
  )

  const presetAmounts = useMemo(() => {
    return presetAmountsConfig.split(',').map((amount) => amount.trim())
  }, [presetAmountsConfig])

  return (
    <div className={styles.inputPage}>
      <AudioAmountPicker
        presetAmounts={presetAmounts}
        onAmountChanged={handleAmountChange}
      />
      <PurchaseQuote />
      <div className={styles.buyButtonContainer}>
        {provider === OnRampProvider.COINBASE ? (
          <CoinbaseBuyAudioButton />
        ) : (
          // TODO: Make stripe button
          <OnRampButton provider={provider!} />
        )}
      </div>
      <div className={styles.conversionNotice}>
        {messages.intermediateSolNoticeCoinbase}
      </div>
    </div>
  )
}
