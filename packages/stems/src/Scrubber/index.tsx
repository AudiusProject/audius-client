import React, { useState, useEffect, useCallback, useRef } from 'react'
import cn from 'classnames'
import moment from 'moment'

import ScrubberProps from './types'
import styles from './styles.module.css'

const SCRUB_RELEASE_TIMEOUT = 200

/** Gets the X-position of a div */
const getXPosition = (element: HTMLDivElement): number => {
  const coords = element.getBoundingClientRect()
  return window.pageXOffset + coords.left
}

/** Gets the width of a div */
const getWidth = (element: HTMLDivElement): number => {
  return element.offsetWidth
}

/** Pretty formats seconds into m:ss */
const formatSeconds = (seconds: number) => {
  return moment.utc(moment.duration(seconds, 'seconds').asMilliseconds()).format('m:ss')
}

const useAnimations = (
  trackRef: React.MutableRefObject<HTMLDivElement>,
  handleRef: React.MutableRefObject<HTMLDivElement>,
  elapsedSeconds: number,
  totalSeconds: number
) => {
  /** Sets animation properties on the handle and track */
  const animate = useCallback((transition: string, transform: string) => {
    if (handleRef.current && trackRef.current) {
      handleRef.current.style.transition = transition
      handleRef.current.style.transform = transform

      trackRef.current.style.transition = transition
      trackRef.current.style.transform = transform
    }
  }, [handleRef, trackRef])

  /** Animates from the current position to the end over the remaining seconds */
  const play = useCallback(() => {
    const timeRemaining = totalSeconds - elapsedSeconds
    animate(`transform ${timeRemaining}s linear`, 'translate(0%)')
  }, [totalSeconds, elapsedSeconds, animate])

  /**
   * Pauses the animation at the current position.
   * NOTE: We derive the current position from the actual animation position
   * rather than the remaining time so that pausing the scrubber does not
   * cause jumping if elapsed seconds doesn't precisely reflect the animation.
   */
  const pause = useCallback(() => {
    const trackWidth = getWidth(trackRef.current)
    const trackRemaining = -1 * parseFloat(window.getComputedStyle(trackRef.current).getPropertyValue('transform').split(',')[4])
    const percentComplete = (trackWidth - trackRemaining) / trackWidth * 100
    animate('none', `translate(${-100 + percentComplete}%)`)
  }, [trackRef, animate])

  /** Sets the animation to a given percentage: [0, 1] */
  const set = useCallback((percentComplete: number) => {
    animate('none', `translate(${-100 + percentComplete * 100}%)`)
  }, [animate])

  return { play, pause, set }
}

/**
 * A smooth scrub-bar that relies on CSS animations rather
 * than progress ticks to achieve fluidity.
 */
const Bar = ({
  uniqueId,
  isPlaying,
  isDisabled,
  elapsedSeconds,
  totalSeconds,
  onScrub,
  onScrubRelease
}: ScrubberProps) => {
  const [previousUniqueId, setPreviousUniqueId] = useState('')

  const [isDragging, setIsDragging] = useState(false)
  // Percentage of the complete scrubber being dragged to.
  // e.g. 0.25 means the user has dragged the scrubber 1/4th of the way.
  const dragPercent = useRef<number>(0)

  // Refs to handle event listeners
  const mouseMoveRef = useRef(null)
  const mouseUpRef = useRef(null)

  // Div refs
  const railRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)

  const { play, pause, set } = useAnimations(trackRef, handleRef, elapsedSeconds, totalSeconds)

  /**
   * Interaction handlers
   */
  const setDragPercent = (e: React.MouseEvent | MouseEvent) => {
    const clickPosition = e.pageX - getXPosition(railRef.current)
    const railWidth = getWidth(railRef.current)
    const percent = Math.min(Math.max(0, clickPosition), railWidth) / railWidth
    dragPercent.current = percent
  }

  const onMouseMove = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    setDragPercent(e)
    set(dragPercent.current)

    const seconds = dragPercent.current * totalSeconds
    onScrub && onScrub(seconds)
  }, [dragPercent, totalSeconds, set, onScrub])

  const onMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', mouseMoveRef.current)
    document.removeEventListener('mouseup', mouseUpRef.current)

    const seconds = dragPercent.current * totalSeconds
    onScrubRelease && onScrubRelease(seconds)

    setIsDragging(false)
  }, [mouseMoveRef, mouseUpRef, dragPercent, totalSeconds, onScrubRelease])

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)

    mouseMoveRef.current = onMouseMove
    mouseUpRef.current = onMouseUp
    document.addEventListener('mousemove', mouseMoveRef.current)
    document.addEventListener('mouseup', mouseUpRef.current)

    setDragPercent(e)
    set(dragPercent.current)
  }

  // Watch interactions to the scrubber and call to animate
  useEffect(() => {
    if (!isDragging) {
      if (isPlaying) play()
      else pause()
    }
  }, [isPlaying, isDragging, play, pause])

  // When the key changes, reset the animation
  useEffect(() => {
    if (uniqueId !== previousUniqueId) {
      set(elapsedSeconds / totalSeconds)
      setPreviousUniqueId(uniqueId)
    }
  }, [uniqueId, previousUniqueId, setPreviousUniqueId, set, elapsedSeconds, totalSeconds])

  return (
    <div
      className={styles.bar}
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

/**
 * Wraps the <Bar /> component and provides timestamp indicators.
 */
const Scrubber = ({
  uniqueId,
  isPlaying,
  isDisabled,
  isMobile,
  includeTimestamps,
  elapsedSeconds,
  totalSeconds,
  onScrub,
  onScrubRelease
}: ScrubberProps) => {
  const [dragSeconds, setDragSeconds] = useState(null)

  const onHandleScrub = (seconds: number) => {
    setDragSeconds(seconds)
    onScrub && onScrub(seconds)
  }

  const onHandleScrubRelease = (seconds: number) => {
    onScrubRelease && onScrubRelease(seconds)
    setTimeout(() => setDragSeconds(null), SCRUB_RELEASE_TIMEOUT)
  }

  const timestampStart = dragSeconds || elapsedSeconds

  return (
    <div
      className={cn(styles.scrubber, {
        [styles.isDisabled]: isDisabled,
        [styles.isMobile]: isMobile
      })}
    >
      {includeTimestamps &&
        <div className={styles.timestampStart}>{formatSeconds(timestampStart)}</div>}
      <Bar
        uniqueId={uniqueId}
        isPlaying={isPlaying}
        isDisabled={isDisabled}
        elapsedSeconds={elapsedSeconds}
        totalSeconds={totalSeconds}
        onScrub={onHandleScrub}
        onScrubRelease={onHandleScrubRelease}
      />
      {includeTimestamps &&
        <div className={styles.timestampEnd}>{formatSeconds(totalSeconds)}</div>}
    </div>
  )
}

export default Scrubber
