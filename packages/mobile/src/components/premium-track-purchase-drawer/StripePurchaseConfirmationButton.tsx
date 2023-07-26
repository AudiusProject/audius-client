import { useCallback } from 'react'

import { Button } from 'app/components/core'
import { useNavigation } from 'app/hooks/useNavigation'
import { createStripeSession } from 'app/services/buyAudio'
import { useThemeColors } from 'app/utils/theme'

const messages = {
  buy: (price: string) => `Buy $${price}`
}

type StripePurchaseConfirmationButtonProps = {
  price: string
}

export const StripePurchaseConfirmationButton = ({
  price
}: StripePurchaseConfirmationButtonProps) => {
  const navigation = useNavigation()
  const { specialLightGreen1 } = useThemeColors()

  const handleBuyPress = useCallback(async () => {
    try {
      const res = await createStripeSession({
        amount: price,
        destinationWallet: 'FgMM3AG1qfpEEdYUiw4Zk9ouqsTkheC3rsu4RjvKtyEB'
      })
      if (res !== undefined && res.client_secret !== undefined) {
        navigation.navigate('StripeOnrampEmbed', {
          clientSecret: res.client_secret
        })
      }
    } catch (e) {
      console.log(e)
    }
  }, [navigation, price])

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
