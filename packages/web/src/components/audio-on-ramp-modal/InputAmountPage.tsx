import { useState, useCallback, useEffect } from 'react'

import { Format, TokenValueInput } from '@audius/stems'
import { TOKEN_LIST_URL } from '@jup-ag/react-hook'
import { Keypair, PublicKey } from '@solana/web3.js'

import { StringAudio } from 'common/models/Wallet'
import {
  CoinbasePayButton,
  CoinbasePayButtonImageResolution,
  CoinbasePayButtonSize,
  CoinbasePayButtonVariant
} from 'components/coinbase-pay-button/CoinbasePayButton'

import styles from './InputAmountPage.module.css'
import { JupiterQuote } from './JupiterQuote'
import { TokenListing } from './types'

const audioPublicKey = new PublicKey(
  '9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM'
)

const cluster = 'mainnet-beta'

const stringAudioToSplAmount = (amount: StringAudio) => {
  return parseInt(amount) * 10 ** 8
}

export const InputAmountPage = ({
  wallet,
  onComplete
}: {
  wallet?: Keypair
  onComplete?: (onCompleteArgs: {
    amount: number
    inputToken: TokenListing
    outputToken: TokenListing
  }) => void
}) => {
  const [tokenList, setTokenList] = useState<TokenListing[]>([])
  const [inputAmount, setInputAmount] = useState<StringAudio>()
  const selectedTokenSymbol = 'SOL'
  // const [selectedTokenSymbol, setSelectedTokenSymbol] = useState('SOL')
  const [intermediateToken, setIntermediateToken] = useState<TokenListing>()
  const [outputAmount, setOutputAmount] = useState<number>()

  const handleInputChange = useCallback(
    (value: string) => {
      setInputAmount(value as StringAudio)
    },
    [setInputAmount]
  )

  const handleCoinbaseSuccess = useCallback(() => {
    const audioToken = tokenList.find(t => t.symbol === 'AUDIO')
    if (intermediateToken && audioToken) {
      onComplete?.({
        amount: outputAmount || 0,
        inputToken: intermediateToken,
        outputToken: audioToken
      })
    }
  }, [onComplete, intermediateToken, tokenList, outputAmount])

  const handleOutputAmount = useCallback(
    amount => {
      setOutputAmount(amount)
    },
    [setOutputAmount]
  )

  useEffect(() => {
    const fn = async () => {
      const res = await fetch(TOKEN_LIST_URL[cluster])
      const json = await res.json()
      setTokenList(json)
    }
    fn()
  }, [setTokenList])

  useEffect(() => {
    const token = tokenList.find(t => t.symbol === selectedTokenSymbol)
    setIntermediateToken(token)
  }, [tokenList, selectedTokenSymbol])

  return (
    <div className={styles.container}>
      <TokenValueInput
        inputClassName={styles.input}
        rightLabelClassName={styles.rightLabel}
        format={Format.INPUT}
        placeholder={'Enter an amount'}
        rightLabel={'$AUDIO'}
        isNumeric
        isWhole
        value={inputAmount}
        onChange={handleInputChange}
      />
      {intermediateToken && wallet ? (
        <JupiterQuote
          amount={inputAmount ? stringAudioToSplAmount(inputAmount) : 0}
          inputMint={audioPublicKey}
          outputToken={intermediateToken}
          onOutputAmount={handleOutputAmount}
          allowedSlippage={1}
        />
      ) : null}
      <CoinbasePayButton
        variant={CoinbasePayButtonVariant.BUY}
        size={CoinbasePayButtonSize.COMPACT}
        resolution={CoinbasePayButtonImageResolution.DEFAULT}
        wallet={wallet}
        onSuccess={handleCoinbaseSuccess}
      />
      <button onClick={handleCoinbaseSuccess}>Skip</button>
    </div>
  )
}
