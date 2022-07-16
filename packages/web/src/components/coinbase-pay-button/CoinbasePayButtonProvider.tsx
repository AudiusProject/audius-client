import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import { initOnRamp } from '@coinbase/cbpay-js'

export const allowedCoinbasePayTokens = ['SOL']

export const CoinbasePayContext = createContext<{
  isReady: boolean
  open: (newProps: {
    presetCryptoAmount?: number
    presetFiatAmount?: number
    setOnSuccess?: () => void
    setOnExit?: () => void
  }) => void
}>({
  isReady: false,
  open: (_) => {}
})

export const CoinbasePayButtonProvider = ({
  destinationWalletAddress,
  children
}: {
  destinationWalletAddress?: string
  children: ReactNode
}) => {
  const [isReady, setIsReady] = useState(false)
  const [shouldOpen, setShouldOpen] = useState(false)
  const cbInstance = useRef<ReturnType<typeof initOnRamp>>()
  const [presetCryptoAmount, setPresetCryptoAmount] = useState<number>()
  const [presetFiatAmount, setPresetFiatAmount] = useState<number>()
  const [onSuccess, setOnSuccess] = useState<() => void>(() => {})
  const [onExit, setOnExit] = useState<() => void>(() => {})

  const open = useCallback(
    (newProps: {
      presetCryptoAmount?: number
      presetFiatAmount?: number
      onSuccess?: () => void
      onExit?: () => void
    }) => {
      // Always override these, to clear out previous state
      setPresetCryptoAmount(newProps.presetCryptoAmount)
      setPresetFiatAmount(newProps.presetFiatAmount)
      if (newProps.onSuccess) {
        setOnSuccess(newProps.onSuccess)
      }
      if (newProps.onExit) {
        setOnExit(newProps.onExit)
      }
      // Open when the amount changes are applied
      setShouldOpen(true)
    },
    [
      setShouldOpen,
      setPresetCryptoAmount,
      setPresetFiatAmount,
      setOnSuccess,
      setOnExit
    ]
  )

  useEffect(() => {
    setIsReady(false)
    if (destinationWalletAddress) {
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
          presetCryptoAmount,
          presetFiatAmount
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
        experienceLoggedIn: 'embedded',
        experienceLoggedOut: 'popup',
        closeOnExit: true,
        closeOnSuccess: true
      })
    }
    return () => cbInstance.current?.destroy()
  }, [
    destinationWalletAddress,
    presetCryptoAmount,
    presetFiatAmount,
    cbInstance,
    onExit,
    onSuccess
  ])

  useEffect(() => {
    // Wait for re-init to finish
    if (shouldOpen && isReady) {
      cbInstance.current?.open()
      setShouldOpen(false)
    }
  }, [shouldOpen, isReady, cbInstance])

  return (
    <CoinbasePayContext.Provider
      value={{
        isReady,
        open
      }}>
      {children}
    </CoinbasePayContext.Provider>
  )
}
