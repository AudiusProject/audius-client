import React, { useState, useEffect } from 'react'
import cn from 'classnames'
import moment from 'moment'

import Slider from './Slider'
import ScrubberProps, { defaultScrubberProps } from './types'
import styles from './Scrubber.module.css'

/** Timeout applied when releasing the drag-handle before timestamps reset. */
const SCRUB_RELEASE_TIMEOUT = 200

/** Pretty formats seconds into m:ss. */
const formatSeconds = (seconds: number) => {
  return moment.utc(moment.duration(seconds, 'seconds').asMilliseconds()).format('m:ss')
}

/**
 * Wraps the `<Slider />` component and provides timestamp indicators.
 */
const Scrubber = ({
  uniqueKey,
  isPlaying,
  isDisabled,
  isMobile,
  includeTimestamps,
  elapsedSeconds,
  totalSeconds,
  onScrub,
  onScrubRelease
}: ScrubberProps) => {
  const [dragSeconds, setDragSeconds] = useState<number | null>(null)

  const onHandleScrub = (seconds: number) => {
    setDragSeconds(seconds)
    onScrub(seconds)
  }

  const onHandleScrubRelease = (seconds: number) => {
    onScrubRelease(seconds)
    if (isPlaying) {
      setTimeout(() => setDragSeconds(null), SCRUB_RELEASE_TIMEOUT)
    }
  }

  useEffect(() => {
    if (isPlaying) {
      setTimeout(() => setDragSeconds(null), SCRUB_RELEASE_TIMEOUT)
    }
  }, [isPlaying])

  const timestampStart = dragSeconds !== null ? dragSeconds : elapsedSeconds

  return (
    <div
      className={cn(styles.scrubber, {
        [styles.isDisabled]: isDisabled,
        [styles.isMobile]: isMobile
      })}
    >
      {includeTimestamps &&
        <div className={styles.timestampStart}>{formatSeconds(timestampStart)}</div>}
      <Slider
        uniqueKey={uniqueKey}
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

Scrubber.defaultProps = defaultScrubberProps

export default Scrubber
