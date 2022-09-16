import { useCallback, useContext } from 'react'

import {
  buyAudioActions,
  buyAudioSelectors,
  OnRampProvider,
  Status
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'
import { useAsync } from 'react-use'

import { CoinbasePayContext } from 'components/coinbase-pay-button'
import { OnRampButton } from 'components/on-ramp-button'
import Tooltip from 'components/tooltip/Tooltip'
import { getRootSolanaAccount } from 'services/audius-backend/BuyAudio'

import styles from './CoinbaseBuyAudioButton.module.css'

const { onRampOpened, onRampCanceled, onRampSucceeded } = buyAudioActions
const { getAudioPurchaseInfo, getAudioPurchaseInfoStatus } = buyAudioSelectors

const messages = {
  belowSolThreshold: 'Coinbase requires a purchase minimum of 0.05 SOL'
}

export const CoinbaseBuyAudioButton = () => {
  const dispatch = useDispatch()
  const coinbasePay = useContext(CoinbasePayContext)
  const rootAccount = useAsync(getRootSolanaAccount)
  const purchaseInfoStatus = useSelector(getAudioPurchaseInfoStatus)
  const purchaseInfo = useSelector(getAudioPurchaseInfo)
  const amount =
    purchaseInfo?.isError === false
      ? purchaseInfo.estimatedSOL.uiAmount
      : undefined

  const belowSolThreshold = amount ? amount < 0.05 : false
  const isDisabled = purchaseInfoStatus !== Status.SUCCESS || belowSolThreshold

  const handleExit = useCallback(() => {
    dispatch(onRampCanceled())
  }, [dispatch])
  const handleSuccess = useCallback(() => {
    dispatch(onRampSucceeded())
  }, [dispatch])

  const handleClick = useCallback(() => {
    if (
      purchaseInfoStatus === Status.SUCCESS &&
      purchaseInfo?.isError === false
    ) {
      coinbasePay.resetParams({
        destinationWalletAddress: rootAccount.value?.publicKey.toString(),
        presetCryptoAmount: amount,
        onSuccess: handleSuccess,
        onExit: handleExit
      })
      dispatch(onRampOpened(purchaseInfo))
      coinbasePay.open()
    }
  }, [
    coinbasePay,
    dispatch,
    purchaseInfoStatus,
    purchaseInfo,
    rootAccount,
    amount,
    handleSuccess,
    handleExit
  ])

  return (
    <Tooltip
      className={styles.tooltip}
      text={messages.belowSolThreshold}
      disabled={!belowSolThreshold}
      color={'--secondary'}
      shouldWrapContent={false}
    >
      <div>
        <OnRampButton
          provider={OnRampProvider.COINBASE}
          className={styles.coinbasePayButton}
          disabled={isDisabled}
          isDisabled={isDisabled}
          onClick={handleClick}
        />
      </div>
    </Tooltip>
  )
}
