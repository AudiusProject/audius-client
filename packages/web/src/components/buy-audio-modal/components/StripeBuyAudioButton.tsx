import { useCallback } from 'react'

import {
  buyAudioActions,
  buyAudioSelectors,
  stripeModalUIActions,
  OnRampProvider,
  modalsActions
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { OnRampButton } from 'components/on-ramp-button'
import Tooltip from 'components/tooltip/Tooltip'
import { getRootSolanaAccount } from 'services/solana/solana'

import styles from './StripeBuyAudioButton.module.css'
const { setVisibility } = modalsActions

const { getAudioPurchaseInfo } = buyAudioSelectors
const { onrampOpened, onrampSucceeded, onrampCanceled } = buyAudioActions
const { initializeStripeModal } = stripeModalUIActions

const messages = {
  belowThreshold: 'Link by Stripe requires a purchase minimum of $1 USD'
}

export const StripeBuyAudioButton = () => {
  const dispatch = useDispatch()

  const purchaseInfo = useSelector(getAudioPurchaseInfo)
  const amount =
    purchaseInfo?.isError === false
      ? purchaseInfo.estimatedSOL.uiAmountString
      : undefined
  const belowThreshold =
    purchaseInfo?.isError === false && purchaseInfo.estimatedUSD.uiAmount < 1

  const handleClick = useCallback(async () => {
    if (!amount || !purchaseInfo || purchaseInfo?.isError === true) {
      return
    }
    dispatch(onrampOpened(purchaseInfo))
    try {
      const destinationWallet: string = (
        await getRootSolanaAccount()
      ).publicKey.toString()
      dispatch(
        initializeStripeModal({
          amount,
          onrampSucceeded,
          onrampCanceled,
          destinationCurrency: 'sol',
          destinationWallet
        })
      )
      dispatch(setVisibility({ modal: 'StripeOnRamp', visible: true }))
    } catch (e) {
      dispatch(onrampCanceled())
      console.error(e)
    }
  }, [dispatch, amount, purchaseInfo])

  return (
    <Tooltip
      className={styles.tooltip}
      text={messages.belowThreshold}
      disabled={!belowThreshold}
      color={'--secondary'}
      shouldWrapContent={false}
    >
      <div>
        <OnRampButton
          isDisabled={belowThreshold}
          disabled={belowThreshold}
          className={styles.button}
          provider={OnRampProvider.STRIPE}
          onClick={handleClick}
        />
      </div>
    </Tooltip>
  )
}
