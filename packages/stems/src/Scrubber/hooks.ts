import React, { useCallback } from 'react'

export const useAnimations = (
  trackRef: React.MutableRefObject<HTMLDivElement>,
  handleRef: React.MutableRefObject<HTMLDivElement>,
  elapsedSeconds: number,
  totalSeconds: number
) => {
  /** Sets animation properties on the handle and track. */
  const animate = useCallback((transition: string, transform: string) => {
    if (handleRef.current && trackRef.current) {
      handleRef.current.style.transition = transition
      handleRef.current.style.transform = transform

      trackRef.current.style.transition = transition
      trackRef.current.style.transform = transform
    }
  }, [handleRef, trackRef])

  /** Animates from the current position to the end over the remaining seconds. */
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
    const trackWidth = trackRef.current.offsetWidth
    const trackTransform = window.getComputedStyle(trackRef.current).getPropertyValue('transform')

    const trackRemaining = -1 * parseFloat(trackTransform.split(',')[4])
    const percentComplete = (trackWidth - trackRemaining) / trackWidth * 100
    animate('none', `translate(${-100 + percentComplete}%)`)
  }, [trackRef, animate])

  /** Sets the animation to a given percentage: [0, 1] */
  const set = useCallback((percentComplete: number) => {
    animate('none', `translate(${-100 + percentComplete * 100}%)`)
  }, [animate])

  return { play, pause, set }
}
