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
  DEFAULT = '',
  X2 = '@2x',
  X3 = '@3x'
}

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
  const [imageSrc, setImageSrc] = useState<string>()
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

  // Lazy load the image
  useEffect(() => {
    const fn = async () => {
      try {
        const module = await import(
          `assets/img/coinbase-pay/${size}/button-cbPay-${size}-${variant}${resolution}.png`
        )
        const image = typeof module === 'string' ? module : module?.default
        setImageSrc(image)
      } catch (e) {
        console.error(`Error: Couldn't load Coinbase Button Image`, {
          size,
          variant,
          resolution
        })
      }
    }
    fn()
  }, [size, variant, resolution, setImageSrc])

  const openCbPay = useCallback(() => {
    cbInstance.current?.open()
  }, [cbInstance])

  return imageSrc !== undefined ? (
    <button
      className={cn(className, styles.payButton)}
      onClick={openCbPay}
      disabled={!isReady}>
      <img
        className={cn({
          [styles.compact]: size === CoinbasePayButtonSize.COMPACT
        })}
        src={imageSrc}
      />
    </button>
  ) : null
}
