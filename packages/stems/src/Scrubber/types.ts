type ScrubberProps = {
  // A unique identifier for the thing being scrubbed.
  // Usually a "track id" suffices here.
  uniqueId: string

  isPlaying: boolean
  isDisabled?: boolean
  isMobile?: boolean

  includeTimestamps?: boolean

  // Current progress of the thing being scrubbed.
  // The scrubber reacts to changes in the elapsed seconds
  // to re-calibrate. This value should be updated relatively frequently
  // (0.1s < x < 1s)
  elapsedSeconds: number
  // Total duration of the thing being scrubbed
  totalSeconds: number

  // Fired incrementally as the user drags the scrubber
  onScrub?: (seconds: number) => void
  // Fired effectively on "mouse up" when the user is done scrubbing
  onScrubRelease?: (seconds: number) => void
}

export default ScrubberProps
