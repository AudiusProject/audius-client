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

type ResetParams = {
  destinationWallet?: string
  presetCryptoAmount?: number
  presetFiatAmount?: number
  onSuccess?: () => void
  onExit?: () => void
}

export const CoinbasePayContext = createContext<{
  isReady: boolean
  isOpen: boolean
  open: () => void
  resetParams: (newProps: ResetParams) => void
}>({
  isReady: false,
  isOpen: false,
  open: () => {},
  resetParams: (_) => {}
})

export const CoinbasePayButtonProvider = ({
  destinationWalletAddress,
  children
}: {
  destinationWalletAddress?: string
  children: ReactNode
}) => {
  const [isReady, setIsReady] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const cbInstance = useRef<ReturnType<typeof initOnRamp>>()

  const resetParams = useCallback(
    ({
      destinationWallet,
      presetCryptoAmount,
      presetFiatAmount,
      onSuccess,
      onExit
    }: ResetParams) => {
      const address = destinationWallet ?? destinationWalletAddress
      if (address) {
        setIsReady(false)
        cbInstance.current?.destroy()
        cbInstance.current = initOnRamp({
          appId: '2cbd65dc-1710-4ae3-ab28-8947b08c22fb',
          widgetParameters: {
            destinationWallets: [
              {
                address,
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
          onSuccess: () => {
            onSuccess?.()
            setIsOpen(false)
          },
          onExit: () => {
            onExit?.()
            setIsOpen(false)
          },
          onEvent: (event: any) => {
            // event stream
            console.log(event)
          },
          experienceLoggedIn: 'embedded',
          experienceLoggedOut: 'popup',
          closeOnExit: true,
          closeOnSuccess: true
        })
      }
    },
    [cbInstance, destinationWalletAddress, setIsOpen]
  )

  const open = useCallback(() => {
    if (cbInstance.current) {
      cbInstance.current.open()
      setIsOpen(true)
    }
  }, [cbInstance, setIsOpen])

  useEffect(() => {
    resetParams({})
  }, [resetParams])

  return (
    <CoinbasePayContext.Provider
      value={{
        isReady,
        isOpen,
        open,
        resetParams
      }}
    >
      {children}
    </CoinbasePayContext.Provider>
  )
}
