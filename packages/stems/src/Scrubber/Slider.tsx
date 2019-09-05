import React, { useState, useEffect, useCallback, useRef } from 'react'
import cn from 'classnames'

import { useAnimations } from './hooks'
import ScrubberProps from './types'
import styles from './Slider.module.css'

/** Gets the X-position of a div. */
const getXPosition = (element: HTMLDivElement) => {
  const coords = element.getBoundingClientRect()
  return window.pageXOffset + coords.left
}

/**
 * A smooth scrubbable slider that relies on CSS animations rather
 * than progress ticks to achieve fluidity.
 */
const Slider = ({
  uniqueKey,
  isPlaying,
  isMobile,
  isDisabled,
  elapsedSeconds,
  totalSeconds,
  onScrub,
  onScrubRelease
}: ScrubberProps) => {
  const [previousUniqueKey, setPreviousUniqueKey] = useState('')

  // Percentage of the complete scrubber being dragged to.
  // e.g. 0.25 means the user has dragged the scrubber 1/4th of the way.
  const dragPercent = useRef(0)

  // Refs to handle event listeners
  const mouseMoveRef = useRef(null)
  const mouseUpRef = useRef(null)

  // Div refs
  const railRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)

  const { play, pause, setPercent } = useAnimations(trackRef, handleRef, elapsedSeconds, totalSeconds)

  /**
   * Sets the percentage across the scrubber for a given mouse event.
   */
  const setDragPercent = (e: React.MouseEvent | MouseEvent) => {
    const clickPosition = e.pageX - getXPosition(railRef.current)
    const railWidth = railRef.current.offsetWidth
    const percent = Math.min(Math.max(0, clickPosition), railWidth) / railWidth
    dragPercent.current = percent
  }

  /**
   * Watches user mouse movements while the scrubber handle is being dragged.
   */
  const onMouseMove = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    setDragPercent(e)
    setPercent(dragPercent.current)

    const seconds = dragPercent.current * totalSeconds
    onScrub(seconds)
  }, [dragPercent, totalSeconds, setPercent, onScrub])

  /**
   * Watches for a mouse-up action (which may not occur on the scrubber itself),
   * calls the release callback, and resets dragging state.
   */
  const onMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', mouseMoveRef.current)
    document.removeEventListener('mouseup', mouseUpRef.current)

    const seconds = dragPercent.current * totalSeconds
    onScrubRelease(seconds)

    dragPercent.current = null
  }, [mouseMoveRef, mouseUpRef, dragPercent, totalSeconds, onScrubRelease])

  /**
   * Attaches mouse-move and mouse-up event listeners and sets dragging state.
   */
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return

    mouseMoveRef.current = onMouseMove
    mouseUpRef.current = onMouseUp
    document.addEventListener('mousemove', mouseMoveRef.current)
    document.addEventListener('mouseup', mouseUpRef.current)

    setDragPercent(e)
    setPercent(dragPercent.current)
  }

  // Watch interactions to the scrubber and call to animate
  useEffect(() => {
    if (!dragPercent.current) {
      if (isPlaying) play()
      else pause()
    }
  }, [isPlaying, dragPercent, play, pause])

  // When the key changes, reset the animation
  useEffect(() => {
    if (uniqueKey !== previousUniqueKey) {
      if (!totalSeconds) {
        setPercent(0)
      } else {
        setPercent(elapsedSeconds / totalSeconds)
      }
      setPreviousUniqueKey(uniqueKey)
    }
  }, [uniqueKey, previousUniqueKey, setPreviousUniqueKey, setPercent, elapsedSeconds, totalSeconds])

  return (
    <div
      className={cn(styles.slider, {
        [styles.isMobile]: isMobile
      })}
      onMouseDown={isDisabled ? () => {} : onMouseDown}
    >
      <div ref={railRef} className={styles.rail}>
        <div ref={trackRef} className={styles.trackWrapper}>
          <div ref={trackRef} className={styles.track} />
        </div>
      </div>
      <div ref={handleRef} className={styles.handleWrapper}>
        <div ref={handleRef} className={styles.handle} />
      </div>
    </div>
  )
}

export default Slider
