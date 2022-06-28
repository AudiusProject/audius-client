import { useEffect, useState } from 'react'

import { initOnRamp } from '@coinbase/cbpay-js'
import uniqueId from 'lodash/uniqueId'

import CbPayButtonCondensed from 'assets/img/coinbase-pay-button-condensed.png'
import CbPayButton from 'assets/img/coinbase-pay-button.png'

export const CoinbasePayButton = ({
  type
}: {
  type?: 'condensed' | 'normal'
}) => {
  const [isReady, setIsReady] = useState(false)
  const [id, setId] = useState('')

  useEffect(() => {
    const genId = uniqueId('cb-pay-')
    setId(genId)
    initOnRamp({
      appId: '2cbd65dc-1710-4ae3-ab28-8947b08c22fb',
      target: `#${genId}`,
      widgetParameters: {
        destinationWallets: [
          {
            address: '0x1A2C69...',
            blockchains: ['solana']
          }
        ]
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
      onEvent: event => {
        // event stream
      },
      experienceLoggedIn: 'popup',
      experienceLoggedOut: 'popup'
    })
  }, [setId])

  // render with button from previous example
  return (
    <a id={id}>
      {isReady ? (
        <img src={type === 'condensed' ? CbPayButtonCondensed : CbPayButton} />
      ) : null}
    </a>
  )
}
