import React, { useCallback, useEffect, useRef, useState } from 'react'

import cn from 'classnames'
import ReactDOM from 'react-dom'
import { useTransition, animated } from 'react-spring'

import { IconRemove } from 'components/Icons'
import { useClickOutside } from 'hooks/useClickOutside'
import { getScrollParent } from 'utils/scrollParent'

import styles from './Popup.module.css'
import { PopupProps, Position, popupDefaultProps } from './types'

/**
 * Gets the css transform origin prop from the display position
 * @param {Position} position
 * @returns {string} transform origin
 */
const getTransformOrigin = (position: Position) =>
  ({
    [Position.TOP_LEFT]: 'bottom right',
    [Position.TOP_CENTER]: 'bottom center',
    [Position.TOP_RIGHT]: 'bottom left',
    [Position.BOTTOM_LEFT]: 'top right',
    [Position.BOTTOM_CENTER]: 'top center',
    [Position.BOTTOM_RIGHT]: 'top left'
  }[position] ?? 'top center')

/**
 * Figures out whether the specified position would overflow the window
 * and picks a better position accordingly
 * @param {Position} position
 * @param {ClientRect} rect the content
 * @param {ClientRect} wrapper the wrapper of the content
 * @return {string | null} null if it would not overflow
 */
const getComputedPosition = (
  position: Position,
  anchorRect: DOMRect,
  wrapperRect: DOMRect
): Position => {
  if (!anchorRect || !wrapperRect) return position
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  const overflowRight = anchorRect.x + wrapperRect.width > windowWidth
  const overflowLeft = anchorRect.x - wrapperRect.width < 0
  const overflowBottom = anchorRect.y + wrapperRect.height > windowHeight
  const overflowTop = anchorRect.y - wrapperRect.height < 0

  if (overflowRight) {
    return position.replace('Right', 'Left') as Position
  }
  if (overflowLeft) {
    return position.replace('Left', 'Right') as Position
  }
  if (overflowTop) {
    return position.replace('top', 'bottom') as Position
  }
  if (overflowBottom) {
    return position.replace('bottom', 'top') as Position
  }
  return position
}

/**
 * A popup is an in-place container that shows on top of the UI. A popup does
 * not impact the rest of the UI (e.g. graying it out). It differs
 * from modals, which do take over the whole UI and are usually
 * center-screened.
 */
export const Popup = ({
  anchorRef,
  animationDuration,
  checkIfClickInside,
  children,
  className,
  isVisible,
  onAfterClose,
  onClose,
  position = Position.BOTTOM_CENTER,
  showHeader,
  title,
  wrapperClassName,
  zIndex
}: PopupProps) => {
  const handleClose = useCallback(() => {
    onClose()
    setTimeout(() => {
      onAfterClose()
    }, animationDuration)
  }, [onClose, onAfterClose, animationDuration])

  const popupRef: React.MutableRefObject<HTMLDivElement> = useClickOutside(
    handleClose,
    checkIfClickInside
  )

  const wrapperRef = useRef<HTMLDivElement>()
  const originalTopPosition = useRef<number>(0)
  const [computedPosition, setComputedPosition] = useState(position)

  const getRects = () =>
    [anchorRef, wrapperRef].map(r => r.current.getBoundingClientRect())

  useEffect(() => {
    if (isVisible) {
      const [anchorRect, wrapperRect] = getRects()
      const computed = getComputedPosition(position, anchorRect, wrapperRect)
      setComputedPosition(computed)
    }
  }, [isVisible, setComputedPosition, position, anchorRef, wrapperRef])

  // On visible, set the position
  useEffect(() => {
    if (isVisible) {
      const [anchorRect, wrapperRect] = getRects()

      const positionMap = {
        [Position.TOP_LEFT]: [
          anchorRect.y - wrapperRect.height,
          anchorRect.x - wrapperRect.width
        ],
        [Position.TOP_CENTER]: [
          anchorRect.y - wrapperRect.height,
          anchorRect.x - wrapperRect.width / 2 + anchorRect.width / 2
        ],
        [Position.TOP_RIGHT]: [
          anchorRect.y - wrapperRect.height,
          anchorRect.x + anchorRect.width
        ],
        [Position.BOTTOM_LEFT]: [
          anchorRect.y + anchorRect.height,
          anchorRect.x - wrapperRect.width
        ],
        [Position.BOTTOM_CENTER]: [
          anchorRect.y + anchorRect.height,
          anchorRect.x - wrapperRect.width / 2 + anchorRect.width / 2
        ],
        [Position.BOTTOM_RIGHT]: [
          anchorRect.y + anchorRect.height,
          anchorRect.x + anchorRect.width
        ]
      }

      const [top, left] =
        positionMap[computedPosition] ?? positionMap[Position.BOTTOM_CENTER]

      wrapperRef.current.style.top = `${top}px`
      wrapperRef.current.style.left = `${left}px`

      originalTopPosition.current = top
    }
  }, [isVisible, wrapperRef, anchorRef, computedPosition, originalTopPosition])

  // Callback invoked on each scroll. Uses original top position to scroll with content.
  // Takes scrollParent to get the current scroll position as well as the intitial scroll position
  // when the popup became visible.
  const watchScroll = useCallback(
    (scrollParent, initialScrollPosition) => {
      const scrollTop = scrollParent.scrollTop
      wrapperRef.current.style.top = `${
        originalTopPosition.current - scrollTop + initialScrollPosition
      }px`
    },
    [wrapperRef, originalTopPosition]
  )

  // Set up scroll listeners
  useEffect(() => {
    if (isVisible && anchorRef.current) {
      const scrollParent = getScrollParent(anchorRef.current)
      const initialScrollPosition = scrollParent.scrollTop
      const listener = () => watchScroll(scrollParent, initialScrollPosition)
      scrollParent.addEventListener('scroll', listener)
      return () => {
        scrollParent.removeEventListener('scroll', listener)
      }
    }

    return () => {}
  }, [isVisible, watchScroll, anchorRef])

  // Set up key listeners
  useEffect(() => {
    if (isVisible) {
      const escapeListener = (e: KeyboardEvent) => {
        if (e.code === 'Escape') {
          handleClose()
        }
      }

      window.addEventListener('keydown', escapeListener)

      return () => window.removeEventListener('keydown', escapeListener)
    }
    return () => {}
  }, [isVisible])

  const transitions = useTransition(isVisible, null, {
    from: {
      transform: `scale(0)`,
      opacity: 0
    },
    enter: {
      transform: `scale(1)`,
      opacity: 1
    },
    leave: {
      transform: `scale(0)`,
      opacity: 0
    },
    config: { duration: 180 },
    unique: true
  })

  const wrapperStyle = zIndex ? { zIndex } : {}

  return (
    <>
      {/* Portal the popup out of the dom structure so that it has a separate stacking context */}
      {ReactDOM.createPortal(
        <div
          ref={wrapperRef}
          className={cn(styles.wrapper, wrapperClassName)}
          style={wrapperStyle}
        >
          {transitions.map(({ item, key, props }) =>
            item ? (
              <animated.div
                className={cn(styles.popup, className)}
                ref={popupRef}
                key={key}
                style={{
                  ...props,
                  transformOrigin: getTransformOrigin(computedPosition)
                }}
              >
                {showHeader && (
                  <div className={styles.header}>
                    <IconRemove
                      className={styles.iconRemove}
                      onClick={handleClose}
                    />
                    <div className={styles.title}>{title}</div>
                  </div>
                )}
                {children}
              </animated.div>
            ) : null
          )}
        </div>,
        document.body
      )}
    </>
  )
}

Popup.defaultProps = popupDefaultProps
