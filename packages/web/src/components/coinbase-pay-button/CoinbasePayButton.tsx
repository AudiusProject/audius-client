import { useCallback, useEffect, useState } from 'react'

import { initOnRamp } from '@coinbase/cbpay-js'
import { Keypair } from '@solana/web3.js'
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
    console.log({ match, filename })
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
  wallet
}: {
  className?: string
  variant?: CoinbasePayButtonVariant
  size?: CoinbasePayButtonSize
  resolution?: CoinbasePayButtonImageResolution
  wallet?: Keypair
  amount?: PaymentCurrencyAmount
}) => {
  const [isReady, setIsReady] = useState(false)
  const [cbInstance, setCbInstance] = useState<any>()

  useEffect(() => {
    if (wallet) {
      const instance = initOnRamp({
        appId: '2cbd65dc-1710-4ae3-ab28-8947b08c22fb',
        widgetParameters: {
          destinationWallets: [
            {
              address: wallet.publicKey.toString(),
              blockchains: ['solana'],
              assets: ['SOL']
            }
          ],
          amount: {
            value: 1,
            currencySymbol: 'SOL'
          }
        },
        onReady: () => {
          // Update loading/ready states.
          setIsReady(true)
        },
        onSuccess: () => {
          // handle navigation when user successfully completes the flow
        },
        onExit: () => {
          // handle navigation from dismiss / exit events due to errors
        },
        onEvent: (event: any) => {
          // event stream
        },
        experienceLoggedIn: 'popup',
        experienceLoggedOut: 'popup'
      })
      setCbInstance(instance)
    }
  }, [setCbInstance, wallet])

  const openCbPay = useCallback(() => {
    cbInstance?.open()
  }, [cbInstance])

  return (
    <a
      className={cn(className, styles.payButton, {
        [styles.disabled]: !isReady
      })}
      onClick={openCbPay}
    >
      <img src={buttonImages[size][variant][resolution]} />
    </a>
  )
}
