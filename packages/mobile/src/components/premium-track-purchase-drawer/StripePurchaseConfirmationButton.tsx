import { useCallback } from 'react'

import type { ID } from '@audius/common'
import {
  accountSelectors,
  purchaseContentActions,
  ContentType
} from '@audius/common'
import { useSelector, useDispatch } from 'react-redux'

import { Button } from 'app/components/core'
import { createStripeSession, getUSDCUserBank } from 'app/services/buyCrypto'
import { setVisibility } from 'app/store/drawers/slice'
import { useThemeColors } from 'app/utils/theme'

const { getAccountWallet } = accountSelectors
const { startPurchaseContentFlow } = purchaseContentActions

const messages = {
  buy: (price: string) => `Buy $${price}`
}

type StripePurchaseConfirmationButtonProps = {
  trackId: ID
  price: string
}

export const StripePurchaseConfirmationButton = ({
  trackId,
  price
}: StripePurchaseConfirmationButtonProps) => {
  const dispatch = useDispatch()
  const { specialLightGreen1 } = useThemeColors()
  const ethWallet = useSelector(getAccountWallet)
  console.log(
    `REED trackId: ${trackId} price: ${price} ethWallet: ${ethWallet}`
  )

  const onPurchaseSuccess = useCallback(() => {
    console.log(`Purchase success for track ${trackId}`)
  }, [trackId])

  const handleBuyPress = useCallback(async () => {
    try {
      // if (ethWallet === null) {
      //   throw new Error('Stripe session creation failed: no eth wallet found')
      // }
      // const usdcUserBank = await getUSDCUserBank(ethWallet)
      // if (usdcUserBank === undefined) {
      //   throw new Error(
      //     'Stripe session creation failed: could not get USDC user bank'
      //   )
      // }
      // const res = await createStripeSession({
      //   amount: price,
      //   destinationWallet: usdcUserBank.toString()
      // })
      // const { client_secret: clientSecret } = res ?? {}
      // if (clientSecret === undefined) {
      //   throw new Error(
      //     'Stripe session creation failed: could not get client secret'
      //   )
      // }
      // if (trackId && clientSecret) {
      //   console.log(
      //     `REED dispatching trackId: ${trackId} clientSecret: ${clientSecret}`
      //   )
        dispatch(
          startPurchaseContentFlow({
            contentId: trackId,
            contentType: ContentType.TRACK,
          })
        )
      }
    // } catch (e) {
    //   console.error(e)
    // }
  }, [dispatch, ethWallet, price, trackId])

  return (
    <Button
      onPress={handleBuyPress}
      title={messages.buy(price)}
      variant={'primary'}
      size='large'
      color={specialLightGreen1}
      fullWidth
    />
  )
}
