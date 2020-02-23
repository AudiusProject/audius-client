import { h } from 'preact'
import { useCallback, useState } from 'preact/hooks'

import styles from './Card.module.css'
import TwitterFooter from '../twitterfooter/TwitterFooter'

const useAspectRatio = (isTwitter) => {
  const [cardStyle, setCardStyle] = useState({})

  const callbackRef = useCallback((element) => {
    if (!element) return

    const aspectRatio = isTwitter ? 0.728 : 0.833
    const viewportAspectRatio = (window.document.body.clientWidth / window.document.body.clientHeight)
    console.log({viewportAspectRatio})

    // TODO: return when I have brainpower
    // Viewport is wider
    if (aspectRatio < viewportAspectRatio) {
      // In this case, we have 'extra' width so height is the constraining factor
      console.log('In case 1')
      console.log({clientHeight: element.parentElement.clientHeight})
      setCardStyle({
        height: `${element.parentElement.clientHeight}px`,
        width: `${element.parentElement.clientHeight * aspectRatio}px`
      })
    } else {
      setCardStyle({
        height: `${element.parentElement.clientWidth / aspectRatio}px`,
        width: `${element.parentElement.clientWidth}px`
      })
      console.log('CASE 2')
      // Here we have extra height, so constrain by width
    }
  }, [setCardStyle])

  console.log({style2: cardStyle })

  return { cardStyle, callbackRef }

}

const Card = ({
  isTwitter,
  backgroundColor,
  twitterURL,
  children
}) => {

  const getDropshadow = () => (isTwitter ? { boxShadow: '0 3px 34px 0 rgba(0, 0 ,0, 0.25)' } : {})

  const { cardStyle, callbackRef } = useAspectRatio(isTwitter)
  console.log({cardStyle})

    return (
      <div
        className={styles.container}
        style={{
          backgroundColor,
          ...cardStyle,
          ...getDropshadow()
        }}
        ref={callbackRef}
      >
        {children}
        {
          isTwitter &&
            <div className={styles.twitterContainer}>
              <TwitterFooter onClickPath={twitterURL} />
            </div>
        }
      </div>
    )
}

export default Card
