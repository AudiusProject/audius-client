import { useCallback, useState } from 'react'

import { Button, ButtonType, IconArrow, IconCheck } from '@audius/stems'
import { useJupiter } from '@jup-ag/react-hook'
import {
  Keypair,
  PublicKey,
  Connection,
  sendAndConfirmTransaction,
  Transaction
} from '@solana/web3.js'

import { ReactComponent as IconCaretLeft } from 'assets/img/iconCaretLeft.svg'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'

import styles from './ExchangeConfirmationPage.module.css'
import { SwapResultSuccess, TokenListing } from './types'

export const ExchangeConfirmationPage = ({
  wallet,
  amount,
  inputToken,
  outputToken,
  allowedSlippage = 0.5,
  onGoBack,
  onExchangeCompleted
}: {
  wallet?: Keypair
  amount: number
  inputToken?: TokenListing
  outputToken?: TokenListing
  allowedSlippage?: number
  onGoBack: () => void
  onExchangeCompleted: (result: SwapResultSuccess) => void
}) => {
  const [isExchanging, setIsExchanging] = useState(false)
  const [isError, setIsError] = useState(false)

  const jupiter = useJupiter({
    amount: inputToken ? amount * 10 ** inputToken.decimals : 0,
    inputMint: inputToken ? new PublicKey(inputToken.address) : undefined,
    outputMint: outputToken ? new PublicKey(outputToken.address) : undefined,
    slippage: allowedSlippage,
    debounceTime: 250
  })

  const bestRoute = jupiter.routes?.[0]
  const outputAmount =
    bestRoute && outputToken
      ? bestRoute.outAmount / 10.0 ** outputToken.decimals
      : 0

  const handleExchange = useCallback(() => {
    if (bestRoute && wallet) {
      setIsExchanging(true)
      setIsError(false)
      const fn = async () => {
        const result = await jupiter.exchange({
          routeInfo: bestRoute,
          wallet: {
            publicKey: wallet.publicKey.toString(),
            signAllTransactions: (transactions: Transaction[]) => {
              for (const transaction of transactions) {
                transaction.sign(wallet)
              }
            },
            signTransaction: (transaction: Transaction) => {
              transaction.sign(wallet)
            },
            sendTransaction: (
              transaction: Transaction,
              connection: Connection,
              options?: any
            ) => {
              return sendAndConfirmTransaction(
                connection,
                transaction,
                [wallet],
                options
              )
            }
          }
        })
        if ('txid' in result) {
          onExchangeCompleted(result)
        } else {
          console.error('Error exchanging tokens:', { error: result.error })
          setIsExchanging(false)
          setIsError(true)
        }
      }

      fn()
    }
  }, [jupiter, bestRoute, wallet, setIsExchanging, onExchangeCompleted])

  if (!inputToken || !outputToken) {
    return null
  }

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>Confirm Transfer</h2>
      <div className={styles.quote}>
        {jupiter.loading ? (
          <LoadingSpinner className={styles.spinner} />
        ) : (
          <div className={styles.spinner} />
        )}
        <div className={styles.token}>
          <DynamicImage
            className={styles.symbolLogo}
            wrapperClassName={styles.symbolLogoContainer}
            image={inputToken.logoURI}
            isUrl={true}
          />
          <span>
            {amount} ${inputToken.symbol}
          </span>
        </div>
        <IconArrow />
        <div className={styles.token}>
          <DynamicImage
            className={styles.symbolLogo}
            wrapperClassName={styles.symbolLogoContainer}
            image={outputToken.logoURI}
            isUrl={true}
          />
          <span>
            {outputAmount} ${outputToken.symbol}
          </span>
        </div>
      </div>
      <Button
        className={styles.confirmButton}
        type={ButtonType.PRIMARY_ALT}
        disabled={jupiter.loading || isExchanging}
        isDisabled={jupiter.loading || isExchanging}
        onClick={handleExchange}
        leftIcon={
          isExchanging ? (
            <LoadingSpinner className={styles.spinner} />
          ) : (
            <IconCheck />
          )
        }
        text={isExchanging ? '' : 'Confirm'}
      />
      {isError ? (
        <div className={styles.error}>
          Something went wrong. Please try again later.
        </div>
      ) : null}
      {!isExchanging ? (
        <div className={styles.goBack} onClick={onGoBack}>
          <IconCaretLeft />
          <span>{'Go Back'}</span>
        </div>
      ) : null}
    </div>
  )
}
