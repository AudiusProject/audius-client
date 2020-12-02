import React, { useEffect, useCallback, useRef, ReactNode } from 'react'
import cn from 'classnames'

import styles from './Drawer.module.css'

import { useSpring, animated } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import useInstanceVar from 'hooks/useInstanceVar'
import {
  EnablePullToRefreshMessage,
  DisablePullToRefreshMessage
} from 'services/native-mobile-interface/android/pulltorefresh'
import { usePortal } from 'hooks/usePortal'
import { useClickOutside } from '@audius/stems'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

// Hide the drawer when the keyboard is down
const DRAWER_KEYBOARD_UP = 50

// Fraction of swipe up to fade (1 / FADE_FRACTION_DENOMINATOR)
const FADE_FRACTION_DENOMINATOR = 2

// Cut off where an open is considered an open
const OPEN_CUTOFF = 0.2
// Cut off where a close is considered a close
const CLOSE_CUTOFF = 0.7
// Cut off where velocity trumps open/close cut offs
const VELOCITY_CUTOFF = 0.5

// Controls the amount of friction in swiping when overflowing up or down
const OVERFLOW_FRICTION = 4

const wobble = {
  mass: 1,
  tension: 250,
  friction: 25
}
const stiff = {
  mass: 1,
  tension: 215,
  friction: 40
}

const fast = {
  mass: 1,
  tension: 300,
  friction: 40
}

// Interpolates a single y-value into a string translate3d
const interpY = (y: number) => `translate3d(0, ${y}px, 0)`

type DrawerProps = {
  isOpen: boolean
  children: ReactNode
  keyboardVisible?: boolean
  shouldClose?: boolean
  onClose?: () => void
}

const Drawer = ({
  isOpen,
  children,
  keyboardVisible,
  shouldClose,
  onClose
}: DrawerProps) => {
  const Portal = usePortal({})

  // Stores whether or not the drawer is "open"
  const [height, setHeight] = useInstanceVar(0)

  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.getBoundingClientRect().height)
    }
  }, [contentRef, setHeight, Portal])

  // Stores the initial translation of the drawer
  const [initialTranslation] = useInstanceVar(0)
  // Stores the last transition
  const [currentTranslation, setCurrentTranslation] = useInstanceVar(0)

  const [drawerSlideProps, setDrawerSlideProps] = useSpring(() => ({
    to: {
      y: -1 * height()
    },
    config: wobble,
    onFrame(frame: any) {
      setCurrentTranslation(frame.y)
    }
  }))

  const [contentFadeProps, setContentFadeProps] = useSpring(() => ({
    to: {
      opacity: 1
    },
    config: stiff
  }))

  const open = useCallback(() => {
    new DisablePullToRefreshMessage().send()
    setDrawerSlideProps({
      to: {
        y: -1 * height()
      },
      immediate: false,
      config: wobble
    })
    setContentFadeProps({
      to: {
        opacity: 1
      },
      immediate: false,
      config: stiff
    })
  }, [setDrawerSlideProps, setContentFadeProps, height])

  const close = useCallback(() => {
    new EnablePullToRefreshMessage(true).send()
    setDrawerSlideProps({
      to: {
        y: initialTranslation()
      },
      immediate: false,
      config: wobble
    })
    setContentFadeProps({
      to: {
        opacity: 1
      },
      immediate: false,
      config: stiff
    })
    if (onClose) onClose()
  }, [initialTranslation, setDrawerSlideProps, setContentFadeProps, onClose])

  // Handle the "controlled" component
  useEffect(() => {
    if (isOpen) {
      open()
    }
  }, [open, height, isOpen])

  useEffect(() => {
    if (shouldClose) {
      close()
    }
  }, [shouldClose, close])

  useEffect(() => {
    const drawerY = keyboardVisible ? DRAWER_KEYBOARD_UP : -1 * height()

    setDrawerSlideProps({
      to: {
        y: drawerY
      },
      immediate: false,
      config: fast
    })
  }, [keyboardVisible, setDrawerSlideProps, height])

  const bind = useDrag(
    ({
      last,
      first,
      vxvy: [, vy],
      movement: [, my],
      memo = currentTranslation()
    }) => {
      if (!contentRef.current) return
      const height = contentRef.current.getBoundingClientRect().height

      let newY = memo + my

      // Overflow dragging up: the height of the drawer drag is > window height
      // Add friction
      const topOverflow = Math.abs(newY) - height
      if (topOverflow > 0) {
        newY = -1 * height - topOverflow / OVERFLOW_FRICTION
      }

      // Overflow dragging down: the height of the drawer < playbar height
      // Add friction
      const bottomOverflow = newY
      if (bottomOverflow > 0) {
        newY = bottomOverflow / OVERFLOW_FRICTION
      }

      if (last) {
        // If this is the last touch event, potentially open or close the drawer
        if (vy === 0) {
          if (Math.abs(newY) > height * OPEN_CUTOFF) {
            open()
          } else {
            close()
          }
          // Click, do nothing
        } else if (vy < 0) {
          // swipe up
          if (
            Math.abs(newY) > height * OPEN_CUTOFF ||
            Math.abs(vy) > VELOCITY_CUTOFF
          ) {
            open()
          } else {
            close()
          }
        } else {
          // swipe down
          if (Math.abs(newY) < height * CLOSE_CUTOFF || vy > VELOCITY_CUTOFF) {
            close()
          } else {
            open()
          }
        }
      } else if (!first) {
        // Otherwise track the touch events with the drawer
        setDrawerSlideProps({
          to: {
            y: newY
          },
          immediate: true,
          config: stiff
        })
        let newFade
        if (Math.abs(newY) > height / FADE_FRACTION_DENOMINATOR) {
          newFade = 1
        } else {
          newFade =
            1 -
            (height / FADE_FRACTION_DENOMINATOR - Math.abs(newY)) /
              (height / FADE_FRACTION_DENOMINATOR)
        }
        setContentFadeProps({
          to: {
            // Animate from opacity 1 to 0 at 1/FADE_FRACTION_DENOMINATOR the height
            opacity: Math.max(0, newFade)
          },
          immediate: true,
          config: stiff
        })
      }
      return memo
    }
  )

  const clickOutsideRef = useClickOutside(() => close())

  return (
    <Portal>
      <animated.div
        ref={clickOutsideRef}
        className={cn(styles.drawer, {
          [styles.native]: NATIVE_MOBILE
        })}
        {...bind()}
        style={{
          // @ts-ignore
          transform: drawerSlideProps.y.interpolate(interpY)
        }}
      >
        <animated.div className={styles.playBar} style={contentFadeProps}>
          <div ref={contentRef}>{children}</div>
        </animated.div>
        {/* "Bottom padding" so over drags upwards of the drawer are white */}
        <div className={styles.skirt} />
      </animated.div>
    </Portal>
  )
}

export default Drawer
