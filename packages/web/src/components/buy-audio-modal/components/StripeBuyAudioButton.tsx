import { useCallback } from 'react'

import {
  OnRampProvider,
  buyAudioSelectors,
  accountSelectors
} from '@audius/common'
import { AudiusLibs } from '@audius/sdk'
import { useSelector } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import { OnRampButton } from 'components/on-ramp-button'

const { getAccountUser } = accountSelectors
const { getAudioPurchaseInfo } = buyAudioSelectors

// TODO: Replace this with Stripe npm package when available
// @ts-ignore
const StripeOnRamp = window.StripeOnramp

export const StripeBuyAudioButton = () => {
  const [, setIsStripeModalVisible] = useModalState('StripeOnRamp')
  const user = useSelector(getAccountUser)

  const purchaseInfo = useSelector(getAudioPurchaseInfo)
  const amount =
    purchaseInfo?.isError === false
      ? purchaseInfo.estimatedSOL.uiAmountString
      : undefined

  const handleClick = useCallback(async () => {
    if (!user?.userBank) {
      console.error('Missing user wallet')
      return
    }
    if (!amount) {
      console.error('Missing purchase amount')
      return
    }
    const libs: AudiusLibs = window.audiusLibs
    const res = await libs.identityService!.createStripeSession({
      amount,
      destinationWallet: user.userBank
    })
    const stripeOnRampInstance = StripeOnRamp(
      // TODO: Put this in an env var
      '<stripe key>'
    )
    const session = stripeOnRampInstance.createSession({
      clientSecret: res.client_secret
    })
    session.mount('#stripe-onramp-modal')
    setIsStripeModalVisible(true)
  }, [setIsStripeModalVisible, amount, user])

  return (
    <OnRampButton
      isDisabled={!user?.userBank || !amount}
      provider={OnRampProvider.STRIPE}
      onClick={handleClick}
    />
  )
}
