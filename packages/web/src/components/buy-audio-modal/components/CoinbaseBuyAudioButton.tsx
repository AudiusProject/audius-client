import { useCallback, useContext } from 'react'

import { buyAudioActions, buyAudioSelectors, Status } from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'
import { useAsync } from 'react-use'

import {
  CoinbasePayButtonProvider,
  CoinbasePayContext,
  CoinbasePayButtonCustom
} from 'components/coinbase-pay-button'
import { getRootSolanaAccount } from 'services/audius-backend/BuyAudio'

const { onRampOpened, onRampCanceled, onRampSucceeded } = buyAudioActions
const { getAudioPurchaseInfoStatus } = buyAudioSelectors

export const CoinbaseBuyAudioButton = ({ amount }: { amount?: number }) => {
  const dispatch = useDispatch()
  const rootAccount = useAsync(getRootSolanaAccount)
  const handleExit = useCallback(() => {
    dispatch(onRampCanceled)
  }, [dispatch])
  const handleSuccess = useCallback(() => {
    dispatch(onRampSucceeded)
  }, [dispatch])
  return (
    <CoinbasePayButtonProvider
      destinationWalletAddress={rootAccount.value?.publicKey.toString()}
      presetCryptoAmount={amount}
      onSuccess={handleSuccess}
      onExit={handleExit}
    >
      <CoinbaseBuyButton />
    </CoinbasePayButtonProvider>
  )
}

const CoinbaseBuyButton = () => {
  const dispatch = useDispatch()
  const coinbasePay = useContext(CoinbasePayContext)
  const purchaseInfoStatus = useSelector(getAudioPurchaseInfoStatus)
  const isDisabled = purchaseInfoStatus === Status.ERROR
  const handleClick = useCallback(() => {
    dispatch(onRampOpened)
    coinbasePay.open()
  }, [coinbasePay, dispatch])
  return (
    <CoinbasePayButtonCustom
      disabled={isDisabled}
      isDisabled={isDisabled}
      onClick={handleClick}
    />
  )
}
