import { useEffect } from 'react'

import { useDispatch } from 'react-redux'

import DynamicImage from 'components/dynamic-image/DynamicImage'
import ConnectedMusicConfetti from 'components/music-confetti/ConnectedMusicConfetti'
import { show as showConfetti } from 'components/music-confetti/store/slice'

import styles from './SuccessPage.module.css'
import { SwapResultSuccess, TokenListing } from './types'

export const SuccessPage = ({
  swapResult,
  inputToken,
  outputToken
}: {
  swapResult?: SwapResultSuccess
  inputToken?: TokenListing
  outputToken?: TokenListing
}) => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(showConfetti())
  }, [dispatch])

  if (!swapResult || !inputToken || !outputToken) {
    return null
  }

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>Congratulations!</h2>
      <p>You successfully bought </p>
      <div className={styles.token}>
        <DynamicImage
          className={styles.symbolLogo}
          wrapperClassName={styles.symbolLogoContainer}
          image={outputToken.logoURI}
          isUrl={true}
        />
        <span>
          {(swapResult?.outputAmount ?? 0) / 10 ** outputToken.decimals} $
          {outputToken.symbol}
        </span>
      </div>
      <ConnectedMusicConfetti />
    </div>
  )
}
