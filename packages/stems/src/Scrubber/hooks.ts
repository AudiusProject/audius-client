import React, { useCallback } from 'react'

/** Sets animation properties on the handle and track. */
const animate = (
  trackRef: React.MutableRefObject<HTMLDivElement>,
  handleRef: React.MutableRefObject<HTMLDivElement>,
  transition: string,
  transform: string
) => {
  if (handleRef.current && trackRef.current) {
    handleRef.current.style.transition = transition
    handleRef.current.style.transform = transform

    trackRef.current.style.transition = transition
    trackRef.current.style.transform = transform
  }
}

/**
 * Hook for initializing animations for a scrubber.
 * const animations = useAnimations()
 */
export const useAnimations = (
  trackRef: React.MutableRefObject<HTMLDivElement>,
  handleRef: React.MutableRefObject<HTMLDivElement>,
  elapsedSeconds: number,
  totalSeconds: number
) => {
  /** Animates from the current position to the end over the remaining seconds. */
  const play = useCallback(() => {
    const timeRemaining = totalSeconds - elapsedSeconds
    animate(trackRef, handleRef, `transform ${timeRemaining}s linear`, 'translate(100%)')
  }, [trackRef, handleRef, totalSeconds, elapsedSeconds])

  /**
   * Pauses the animation at the current position.
   * NOTE: We derive the current position from the actual animation position
   * rather than the remaining time so that pausing the scrubber does not
   * cause jumping if elapsed seconds doesn't precisely reflect the animation.
   */
  const pause = useCallback(() => {
    const trackWidth = trackRef.current.offsetWidth
    const trackTransform = window.getComputedStyle(trackRef.current).getPropertyValue('transform')

    const trackPosition = parseFloat(trackTransform.split(',')[4])
    const percentComplete = trackPosition / trackWidth
    animate(trackRef, handleRef, 'none', `translate(${percentComplete * 100}%)`)
  }, [trackRef, handleRef])

  /** Sets the animation to a given percentage: [0, 1]. */
  const setPercent = useCallback((percentComplete: number) => {
    animate(trackRef, handleRef, 'none', `translate(${percentComplete * 100}%)`)
  }, [trackRef, handleRef])

  return { play, pause, setPercent }
}
