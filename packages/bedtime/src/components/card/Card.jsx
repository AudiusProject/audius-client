import { h, createContext } from 'preact'
import { useCallback, useState, useContext, useMemo } from 'preact/hooks'

import styles from './Card.module.css'
import TwitterFooter from '../twitterfooter/TwitterFooter'
import { isMobileWebTwitter } from '../../util/isMobileWebTwitter'

const ASPECT_RATIOS = {
  standard:  0.833,
  twitter: 0.728
}


export const CardDimensionsContext = createContext({
  height: 0,
  width: 0,
  setDimensions: (dimension) => {}
})

export const CardContextProvider = (props) => {
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 })

  return (
    <CardDimensionsContext.Provider
      value={{
        height: dimensions.height,
        width: dimensions.width,
        setDimensions: (d) => {
          console.log('setting dimensions' + JSON.stringify(d))
          setDimensions(d)
        }
      }}
    >
    { props.children }
    </CardDimensionsContext.Provider>
  )
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
      setCardStyle({
        height: `${window.document.documentElement.clientHeight}px`,
        width: `${window.document.documentElement.clientWidth}px`
      })
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
  const { setDimensions } = useContext(CardDimensionsContext)
  const { cardStyle, callbackRef } = useAspectRatio(isTwitter, mobileWebTwitter)
  const height = cardStyle.height

  useMemo(() => {
    console.log({cardStyle})
    if (!cardStyle.width || cardStyle.width === 0) {
      return
    }
    // Feed the style into the card dimensions context
    const newStyle = {
      width: parseInt(cardStyle.width.replace('px', '')),
      height: parseInt(cardStyle.height.replace('px', ''))
    }
    setDimensions(newStyle)
  }, [height])

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
