import { useEffect } from 'react'

import { useJupiter } from '@jup-ag/react-hook'
import { PublicKey } from '@solana/web3.js'

import DynamicImage from 'components/dynamic-image/DynamicImage'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'

import styles from './JupiterQuote.module.css'
import { TokenListing } from './types'

export const JupiterQuote = ({
  allowedSlippage = 0.5,
  amount,
  inputMint,
  outputToken,
  onOutputAmount
}: {
  allowedSlippage?: number
  amount: number
  inputMint: PublicKey
  outputToken: TokenListing
  onOutputAmount: (amount: number) => void
}) => {
  const slippageAdjustmentPercent = 1 + allowedSlippage / 100.0

  const jupiter = useJupiter({
    amount,
    inputMint,
    outputMint: new PublicKey(outputToken?.address),
    slippage: allowedSlippage, // 0.5% slippage
    debounceTime: 250
  })
  const bestRoute = jupiter.routes?.[0]

  const outputAmount = bestRoute
    ? Math.ceil(bestRoute.outAmount * slippageAdjustmentPercent) /
      10 ** outputToken.decimals
    : 0

  useEffect(() => {
    if (outputAmount !== undefined) {
      onOutputAmount(outputAmount)
    }
  }, [outputAmount, onOutputAmount])

  return (
    <div>
      <div className={styles.quote}>
        {jupiter.loading ? (
          <LoadingSpinner className={styles.spinner} />
        ) : (
          <div className={styles.spinner} />
        )}
        <DynamicImage
          className={styles.symbolLogo}
          wrapperClassName={styles.symbolLogoContainer}
          image={outputToken.logoURI}
          isUrl={true}
        />
        <span>
          Estimated Cost:* {outputAmount} ${outputToken.symbol}
        </span>
      </div>
      <div className={styles.finePrint}>
        (*) To help ensure you get the amount of $AUDIO you specified, the
        quoted amount of ${outputToken.symbol} has been padded by{' '}
        {allowedSlippage}% to account for possible slippage (fluctuations in
        price that happen between the time of the quote and the exchange).
      </div>
    </div>
  )
}
