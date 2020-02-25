import { h } from 'preact'
import { useCallback, useState } from 'preact/hooks'

import styles from './Card.module.css'
import TwitterFooter from '../twitterfooter/TwitterFooter'
import { isMobileWebTwitter } from '../../util/isMobileWebTwitter'

const ASPECT_RATIOS = {
  standard:  0.833,
  twitter: 0.728
}


// Calculates height and width of the card given
// it's desired aspect ratio and the parent's
// intrinsic dimensions.
const useAspectRatio = (isTwitter, mobileWebTwitter) => {
  const [cardStyle, setCardStyle] = useState({})

  const callbackRef = useCallback((element) => {
    if (!element) return

    // Specialcase check for mobile twitter
    // If it's a square aspect ratio and
    // below a certain width, we should render
    // the card square fullscreen.
    if (mobileWebTwitter) {
      setCardStyle({ height: '100vh', width: '100vw' })
      return
    }

    const aspectRatio = isTwitter ? ASPECT_RATIOS.twitter : ASPECT_RATIOS.standard
    const viewportAspectRatio = (window.document.body.clientWidth / window.document.body.clientHeight)

    if (aspectRatio < viewportAspectRatio) {
      // In this case, we have 'extra' width so height is the constraining factor
      setCardStyle({
        height: `${element.parentElement.clientHeight}px`,
        width: `${element.parentElement.clientHeight * aspectRatio}px`
      })
    } else {
      // Extra height, so width constrains.
      setCardStyle({
        height: `${element.parentElement.clientWidth / aspectRatio}px`,
        width: `${element.parentElement.clientWidth}px`
      })
    }
  }, [setCardStyle])

  return { cardStyle, callbackRef }
}

const Card = ({
  isTwitter,
  backgroundColor,
  twitterURL,
  children
}) => {

  // Need to make the injected BG color slightly transparent
  const transparentBg = `${backgroundColor.slice(0, backgroundColor.length - 1)}, 0.5)`
  const mobileWebTwitter = isMobileWebTwitter(isTwitter)

  // Don't display dropshadow on mobile web twitter
  // bc we want to display it fullscreen
  const getDropshadow = () => (isTwitter && !mobileWebTwitter ? { boxShadow: `0 3px 34px 0 ${transparentBg}` } : {})
  // No border radius on mobile web twitter
  const getBorderRadius = () => mobileWebTwitter ? 0 : 12

  const { cardStyle, callbackRef } = useAspectRatio(isTwitter, mobileWebTwitter)
  const displayTwitterFooter = isTwitter && !mobileWebTwitter

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor,
        ...cardStyle,
        ...getDropshadow(),
        ...{ borderRadius: `${getBorderRadius()}px`}
      }}
      ref={callbackRef}
    >
      {children}
      {
        displayTwitterFooter &&
        <div
          className={styles.twitterContainer}
          style={{
            borderBottomLeftRadius: `${getBorderRadius()}px`,
            borderBottomRightRadius: `${getBorderRadius()}px`
          }}
        >
          <TwitterFooter onClickPath={twitterURL} />
        </div>
      }
    </div>
  )
}

export default Card
