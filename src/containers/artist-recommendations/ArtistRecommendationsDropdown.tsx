import React, { useEffect, useRef, useState } from 'react'

import { useSpring, animated } from 'react-spring'

import {
  ArtistRecommendations,
  ArtistRecommendationsProps
} from './ArtistRecommendations'
import styles from './ArtistRecommendationsDropdown.module.css'

type ArtistRecommendationsDropdownProps = Omit<
  ArtistRecommendationsProps,
  'ref' | 'className' | 'itemClassName'
> & {
  isVisible: boolean
}

export const ArtistRecommendationsDropdown = (
  props: ArtistRecommendationsDropdownProps
) => {
  const { isVisible } = props
  const childRef = useRef<HTMLElement | null>(null)
  const [calculatedHeight, setCalculatedHeight] = useState(0)

  useEffect(() => {
    const rect = childRef.current?.getBoundingClientRect()
    if (rect) {
      const height = rect.bottom - rect.top
      if (height > 0) {
        setCalculatedHeight(height)
      }
    }
  }, [childRef, isVisible])

  const toHide = {
    opacity: 0,
    height: '0'
  }
  const toShow = {
    opacity: 1.0,
    height: `${calculatedHeight}px`
  }
  console.log({ toShow })
  const spring = useSpring(isVisible && calculatedHeight > 0 ? toShow : toHide)
  console.log({ spring })

  return (
    <animated.div className={styles.dropdown} style={spring}>
      <ArtistRecommendations
        ref={childRef}
        className={styles.artistRecommendations}
        itemClassName={styles.artistRecommendationsItem}
        {...props}
      />
    </animated.div>
  )
}
