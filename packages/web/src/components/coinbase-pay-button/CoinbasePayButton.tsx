import { useCallback, useEffect, useRef, useState } from 'react'

import { initOnRamp } from '@coinbase/cbpay-js'
import cn from 'classnames'

import styles from './CoinbasePayButton.module.css'

export enum CoinbasePayButtonVariant {
  ADD_CRYPTO = 'addCrypto',
  ADD_ETH = 'addEth',
  BUY = 'buy',
  CONTINUE = 'continue',
  GENERIC_CONDENSED = 'generic-condensed',
  GENERIC = 'generic'
}
export enum CoinbasePayButtonSize {
  NORMAL = 'normal',
  COMPACT = 'compact'
}
export enum CoinbasePayButtonImageResolution {
  DEFAULT = '1x',
  X2 = '2x',
  X3 = '3x'
}

const importAll = (r: __WebpackModuleApi.RequireContext) => {
  const map: Record<
    CoinbasePayButtonSize,
    Partial<Record<CoinbasePayButtonVariant, any>>
  > = {
    [CoinbasePayButtonSize.COMPACT]: {},
    [CoinbasePayButtonSize.NORMAL]: {}
  }
  r.keys().forEach((filename: string, index) => {
    const match = filename.match(
      /button-cbPay-(compact|normal)-(.*?)(?:@(2x|3x))?\..*/
    )
    if (match) {
      const size = match[1] as CoinbasePayButtonSize
      const variant = match[2] as CoinbasePayButtonVariant
      const resolution =
        (match[3] as CoinbasePayButtonImageResolution) ||
        CoinbasePayButtonImageResolution.DEFAULT
      map[size][variant] = {
        ...map[size][variant],
        [resolution]: r(filename).default
      }
    }
  })
  return map
}
const buttonImages = importAll(
  require.context('assets/img/coinbase-pay', true, /\.(png)$/)
)

export const allowedCoinbasePayTokens = ['SOL']

export const CoinbasePayButton = ({
  className,
  variant = CoinbasePayButtonVariant.GENERIC,
  size = CoinbasePayButtonSize.NORMAL,
  resolution = CoinbasePayButtonImageResolution.DEFAULT,
  destinationWalletAddress,
  amount,
  onSuccess,
  onExit
}: {
  className?: string
  variant?: CoinbasePayButtonVariant
  size?: CoinbasePayButtonSize
  resolution?: CoinbasePayButtonImageResolution
  destinationWalletAddress?: string
  amount?: number
  onSuccess?: () => void
  onExit?: () => void
}) => {
  const [isReady, setIsReady] = useState(false)
  const cbInstance = useRef<ReturnType<typeof initOnRamp>>()

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

  const openCbPay = useCallback(() => {
    cbInstance.current?.open()
  }, [cbInstance])

  return (
    <button
      className={cn(className, styles.payButton)}
      onClick={openCbPay}
      disabled={!isReady}>
      <img src={buttonImages[size][variant][resolution]} />
    </button>
  )
}
