import React, { useState, useEffect } from 'react'
import cn from 'classnames'
import moment from 'moment'

import Slider from './Slider'
import ScrubberProps, { defaultScrubberProps } from './types'
import styles from './Scrubber.module.css'

const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR

/** Timeout applied when releasing the drag-handle before timestamps reset. */
const SCRUB_RELEASE_TIMEOUT_MS = 200

/** Pretty formats seconds into m:ss. */
const formatSeconds = (seconds: number) => {
  const utc = moment.utc(moment.duration(seconds, 'seconds').asMilliseconds())
  if (seconds > SECONDS_PER_HOUR) {
    return utc.format('h:mm:ss')
  }
  return utc.format('m:ss')
}

/**
 * Wraps the `<Slider />` component and provides timestamp indicators.
 */
const Scrubber = ({
  mediaKey,
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

  const resetDragSeconds = (isPlaying: boolean) => {
    if (isPlaying) {
      setTimeout(() => setDragSeconds(null), SCRUB_RELEASE_TIMEOUT_MS)
    }
  }

  const onHandleScrub = (seconds: number) => {
    setDragSeconds(seconds)
    onScrub(seconds)
  }

  const onHandleScrubRelease = (seconds: number) => {
    onScrubRelease(seconds)
    resetDragSeconds(isPlaying)
  }

  useEffect(() => {
    resetDragSeconds(isPlaying)
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
        mediaKey={mediaKey}
        isPlaying={isPlaying}
        isDisabled={isDisabled}
        isMobile={isMobile}
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
