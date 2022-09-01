import { useCallback, useContext } from 'react'

import { buyAudioActions, buyAudioSelectors, Status } from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'
import { useAsync } from 'react-use'

import {
  CoinbasePayContext,
  CoinbasePayButtonCustom
} from 'components/coinbase-pay-button'
import Tooltip from 'components/tooltip/Tooltip'
import { getRootSolanaAccount } from 'services/audius-backend/BuyAudio'
import { getCurrentThemeColors } from 'utils/theme/theme'

import styles from './CoinbaseBuyAudioButton.module.css'

const { onRampOpened, onRampCanceled, onRampSucceeded } = buyAudioActions
const { getAudioPurchaseInfo, getAudioPurchaseInfoStatus } = buyAudioSelectors

const messages = {
  belowSolThreshold: 'Coinbase requires a purchase minimum of 0.05 SOL'
}

const themeColors = getCurrentThemeColors()

export const CoinbaseBuyAudioButton = ({
  amount
}: {
  amount: number | undefined
}) => {
  const dispatch = useDispatch()
  const coinbasePay = useContext(CoinbasePayContext)
  const rootAccount = useAsync(getRootSolanaAccount)
  const purchaseInfoStatus = useSelector(getAudioPurchaseInfoStatus)
  const purchaseInfo = useSelector(getAudioPurchaseInfo)
  const belowSolThreshold =
    !purchaseInfo?.isError && purchaseInfo?.estimatedSOL
      ? purchaseInfo.estimatedSOL.uiAmount < 0.05
      : false
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
      color={themeColors['--secondary']}
      shouldWrapContent={false}
    >
      <div>
        <CoinbasePayButtonCustom
          className={styles.coinbasePayButton}
          disabled={isDisabled}
          isDisabled={isDisabled}
          onClick={handleClick}
        />
      </div>
    </Tooltip>
  )
}
