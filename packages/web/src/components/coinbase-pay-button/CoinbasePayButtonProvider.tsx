import { useCallback, useEffect, useRef, useState } from 'react'

import { initOnRamp } from '@coinbase/cbpay-js'

export const allowedCoinbasePayTokens = ['SOL']

export const CoinbasePayButtonProvider = ({
  destinationWalletAddress,
  amount,
  onSuccess,
  onExit,
  children
}: {
  destinationWalletAddress?: string
  amount?: number
  onSuccess?: () => void
  onExit?: () => void
  children: ({
    isReady,
    openCoinbasePayModal
  }: {
    isReady: boolean
    openCoinbasePayModal: () => void
  }) => React.ReactNode
}) => {
  const [isReady, setIsReady] = useState(false)
  const cbInstance = useRef<ReturnType<typeof initOnRamp>>()

  const openCoinbasePayModal = useCallback(() => {
    cbInstance.current?.open()
  }, [cbInstance])

  useEffect(() => {
    if (destinationWalletAddress && amount) {
      cbInstance.current = initOnRamp({
        appId: '2cbd65dc-1710-4ae3-ab28-8947b08c22fb',
        widgetParameters: {
          destinationWallets: [
            {
              address: destinationWalletAddress,
              blockchains: ['solana'],
              assets: ['SOL']
            }
          ],
          presetCryptoAmount: amount
        },
        onReady: () => {
          // Update loading/ready states.
          setIsReady(true)
        },
        onSuccess,
        onExit,
        onEvent: (event: any) => {
          // event stream
        },
        experienceLoggedIn: 'popup',
        experienceLoggedOut: 'popup',
        closeOnExit: true,
        closeOnSuccess: true
      })
    } else {
      setIsReady(false)
    }
    return () => cbInstance.current?.destroy()
  }, [destinationWalletAddress, amount, cbInstance, onExit, onSuccess])

  return <>{children({ isReady, openCoinbasePayModal })}</>
}
