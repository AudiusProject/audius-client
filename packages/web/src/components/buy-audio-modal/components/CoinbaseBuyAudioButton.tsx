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

const { onRampOpened } = buyAudioActions
const { getAudioPurchaseInfoStatus } = buyAudioSelectors

export const CoinbaseBuyAudioButton = ({ amount }: { amount?: number }) => {
  const rootAccount = useAsync(getRootSolanaAccount)
  return (
    <CoinbasePayButtonProvider
      destinationWalletAddress={rootAccount.value?.publicKey.toString()}
      presetCryptoAmount={amount}
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
