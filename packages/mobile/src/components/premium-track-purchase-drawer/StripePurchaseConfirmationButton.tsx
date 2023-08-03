import { useCallback } from 'react'

import { accountSelectors } from '@audius/common'
import { useSelector, useDispatch } from 'react-redux'

import { Button } from 'app/components/core'
import { useNavigation } from 'app/hooks/useNavigation'
import { createStripeSession, getUSDCUserBank } from 'app/services/buyCrypto'
import { setVisibility } from 'app/store/drawers/slice'
import { useThemeColors } from 'app/utils/theme'

const { getAccountERCWallet } = accountSelectors

const messages = {
  buy: (price: string) => `Buy $${price}`
}

type StripePurchaseConfirmationButtonProps = {
  price: string
}

export const StripePurchaseConfirmationButton = ({
  price
}: StripePurchaseConfirmationButtonProps) => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const { specialLightGreen1 } = useThemeColors()
  const ethWallet = useSelector(getAccountERCWallet)

  const handleBuyPress = useCallback(async () => {
    try {
      if (ethWallet === null) {
        throw new Error('Stripe session creation failed: no eth wallet found')
      }
      const usdcUserBank = await getUSDCUserBank(ethWallet)
      if (usdcUserBank === undefined) {
        throw new Error(
          'Stripe session creation failed: could not get USDC user bank'
        )
      }
      const res = await createStripeSession({
        amount: price,
        destinationWallet: usdcUserBank.toString(),
        destinationCurrency: 'usdc'
      })
      if (res === undefined || res.client_secret === undefined) {
        throw new Error(
          'Stripe session creation failed: could not get client secret'
        )
      }
      dispatch(
        setVisibility({
          drawer: 'PremiumTrackPurchase',
          visible: false
        })
      )
      navigation.navigate('StripeOnrampEmbed', {
        clientSecret: res.client_secret
      })
    } catch (e) {
      console.error(e)
    }
  }, [dispatch, ethWallet, navigation, price])

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
